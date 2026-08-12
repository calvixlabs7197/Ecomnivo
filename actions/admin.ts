"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/guards";
import { CATEGORY_SLUGS } from "@/config/categories";
import { getTool } from "@/lib/tools/catalog";
import { seedGuideSlugs } from "@/lib/content/guides";
import { seedPageSlugs } from "@/lib/content/pages";
import { ReadOnlyStoreError } from "@/lib/db/store";
import {
  defaultSettings,
  deleteGuideRecord,
  deletePageRecord,
  getGuideRecord,
  getPageRecord,
  logActivity,
  saveSettings,
  upsertGuideRecord,
  upsertPageRecord,
  upsertToolRecord,
} from "@/lib/db/repositories";

/**
 * Every mutation follows the same five steps, in this order:
 *
 *   1. authorize   — requireRole, server-side, never trusting the UI
 *   2. validate    — zod, because a form can send anything
 *   3. mutate      — the repository
 *   4. audit       — who did what, append-only
 *   5. revalidate  — so the public page is correct within seconds
 *
 * A pull request that skips one of these gets rejected. They are listed here
 * rather than in a wiki because this is the file people copy from.
 */

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const boolish = z.union([z.literal("true"), z.literal("false")]).transform((v) => v === "true");

function fields(formData: FormData): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    // A checkbox submits its hidden "false" then "true"; the last one wins.
    if (typeof value === "string") entries[key] = value;
  }
  return entries;
}

export interface ActionState {
  error?: string;
  success?: string;
}

function fail(error: z.ZodError): ActionState {
  const first = error.issues[0];
  return { error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input." };
}

/**
 * Runs the mutate-and-audit half of an action.
 *
 * Its job is to turn a read-only filesystem into a sentence the person who
 * clicked Save can act on. Serverless hosting cannot accept these writes, and
 * an unhandled 500 there would look like a bug rather than the documented
 * limitation of this storage backend.
 */
async function commit(operation: () => Promise<void>): Promise<ActionState | null> {
  try {
    await operation();
    return null;
  } catch (error) {
    if (error instanceof ReadOnlyStoreError) return { error: error.message };
    throw error;
  }
}

// --- tools ---------------------------------------------------------------------

const toolSchema = z.object({
  slug: z.string().regex(slugPattern),
  name: optionalText,
  shortDescription: optionalText,
  seoTitle: optionalText,
  seoDescription: optionalText,
  categorySlug: z.enum(CATEGORY_SLUGS),
  isPublished: boolish,
  isFeatured: boolish,
  sortOrder: z.coerce.number().int().min(0).max(999),
  relatedTools: z.string().trim().optional(),
});

export async function saveTool(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole("admin");

  const parsed = toolSchema.safeParse(fields(formData));
  if (!parsed.success) return fail(parsed.error);
  const data = parsed.data;

  // The slug must name a calculator that actually exists in code. Admin edits
  // the shell around a tool; it cannot invent one (§0, decision 1).
  if (!getTool(data.slug)) return { error: `No calculator exists with the slug "${data.slug}".` };

  const related = (data.relatedTools ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const unknown = related.filter((slug) => !getTool(slug));
  if (unknown.length > 0) return { error: `Unknown related tools: ${unknown.join(", ")}` };
  if (related.includes(data.slug)) return { error: "A tool cannot be related to itself." };

  const failure = await commit(async () => {
    await upsertToolRecord({
      slug: data.slug,
      name: data.name,
      shortDescription: data.shortDescription,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      categorySlug: data.categorySlug,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
      relatedTools: related,
      updatedAt: new Date().toISOString(),
    });

    await logActivity({
      actor: session.role,
      action: "tool.update",
      entityType: "tool",
      entityId: data.slug,
      summary: `Updated ${data.slug}${data.isPublished ? "" : " (unpublished)"}`,
    });
  });

  if (failure) return failure;

  revalidatePath("/", "layout");

  return { success: "Saved." };
}

// --- guides --------------------------------------------------------------------

const guideSchema = z.object({
  slug: z.string().regex(slugPattern, "Use lowercase words separated by hyphens."),
  title: z.string().trim().min(3),
  excerpt: z.string().trim().min(20),
  contentMd: z.string().trim().min(50, "A guide needs real content."),
  category: z.string().trim().min(2),
  tags: z.string().trim().optional(),
  authorName: z.string().trim().min(2),
  publishedAt: z.string().trim().min(4),
  seoTitle: optionalText,
  seoDescription: optionalText,
  status: z.enum(["draft", "scheduled", "published"]),
  isIndexable: boolish,
  relatedTools: z.string().trim().optional(),
});

export async function saveGuide(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole("editor");

  const parsed = guideSchema.safeParse(fields(formData));
  if (!parsed.success) return fail(parsed.error);
  const data = parsed.data;

  if (Number.isNaN(new Date(data.publishedAt).getTime())) {
    return { error: "Publish date is not a valid date." };
  }

  const related = (data.relatedTools ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const unknown = related.filter((slug) => !getTool(slug));
  if (unknown.length > 0) return { error: `Unknown related tools: ${unknown.join(", ")}` };

  const existing = await getGuideRecord(data.slug);
  const now = new Date().toISOString();

  const failure = await commit(async () => {
    await upsertGuideRecord({
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    contentMd: data.contentMd,
    category: data.category,
    tags: (data.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    author: { name: data.authorName },
    publishedAt: new Date(data.publishedAt).toISOString(),
    updatedAt: now,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    isIndexable: data.isIndexable,
    relatedTools: related,
      status: data.status,
      createdAt: existing?.createdAt ?? now,
    });

    await logActivity({
      actor: session.role,
      action: existing ? "guide.update" : "guide.create",
      entityType: "guide",
      entityId: data.slug,
      summary: `${existing ? "Updated" : "Created"} "${data.title}" (${data.status})`,
    });
  });

  if (failure) return failure;

  revalidatePath("/", "layout");

  return { success: "Saved." };
}

export async function removeGuide(formData: FormData) {
  const session = await requireRole("editor");
  const slug = String(formData.get("slug") ?? "");

  await deleteGuideRecord(slug);
  await logActivity({
    actor: session.role,
    action: "guide.delete",
    entityType: "guide",
    entityId: slug,
    // Deleting an override restores the built-in guide rather than removing it.
    summary: seedGuideSlugs.has(slug)
      ? `Reverted "${slug}" to the built-in version`
      : `Deleted guide "${slug}"`,
  });

  revalidatePath("/", "layout");
  redirect("/admin/guides");
}

// --- pages ---------------------------------------------------------------------

const pageSchema = z.object({
  slug: z.string().regex(slugPattern, "Use lowercase words separated by hyphens."),
  title: z.string().trim().min(3),
  contentMd: z.string().trim().min(20),
  seoTitle: optionalText,
  seoDescription: optionalText,
  isPublished: boolish,
  isIndexable: boolish,
});

/** Slugs the admin must not claim, because a real route already owns them. */
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "tools",
  "guides",
  "categories",
  "search",
  "faq",
  "sitemap.xml",
  "robots.txt",
]);

export async function savePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole("editor");

  const parsed = pageSchema.safeParse(fields(formData));
  if (!parsed.success) return fail(parsed.error);
  const data = parsed.data;

  if (RESERVED_SLUGS.has(data.slug)) {
    return { error: `"${data.slug}" is reserved by an existing route.` };
  }

  const existing = await getPageRecord(data.slug);
  const now = new Date().toISOString();

  const failure = await commit(async () => {
    await upsertPageRecord({
    slug: data.slug,
    title: data.title,
    contentMd: data.contentMd,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    updatedAt: now,
    isIndexable: data.isIndexable,
    isPublished: data.isPublished,
      isDeletable: !seedPageSlugs.has(data.slug),
      createdAt: existing?.createdAt ?? now,
    });

    await logActivity({
      actor: session.role,
      action: existing ? "page.update" : "page.create",
      entityType: "page",
      entityId: data.slug,
      summary: `${existing ? "Updated" : "Created"} page "${data.title}"`,
    });
  });

  if (failure) return failure;

  revalidatePath("/", "layout");

  return { success: "Saved." };
}

export async function removePage(formData: FormData) {
  const session = await requireRole("editor");
  const slug = String(formData.get("slug") ?? "");

  await deletePageRecord(slug);
  await logActivity({
    actor: session.role,
    action: "page.delete",
    entityType: "page",
    entityId: slug,
    summary: seedPageSlugs.has(slug)
      ? `Reverted "${slug}" to the built-in version`
      : `Deleted page "${slug}"`,
  });

  revalidatePath("/", "layout");
  redirect("/admin/pages");
}

// --- settings ------------------------------------------------------------------

const settingsSchema = z.object({
  siteName: z.string().trim().min(2),
  tagline: z.string().trim().min(4),
  description: z.string().trim().min(20),
  contactEmail: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), {
      message: "Enter a valid email address, or leave blank.",
    }),
  defaultSeoTitle: z.string().trim().min(4),
  defaultSeoDescription: z.string().trim().min(20).max(165),
  ga4MeasurementId: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || /^G-[A-Z0-9]+$/.test(value), {
      message: "GA4 measurement IDs look like G-XXXXXXXXXX.",
    }),
  adClientId: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value)),
});

export async function saveSiteSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("super_admin");

  const parsed = settingsSchema.safeParse(fields(formData));
  if (!parsed.success) return fail(parsed.error);

  const failure = await commit(async () => {
    await saveSettings({ ...defaultSettings(), ...parsed.data, socials: [] });

    await logActivity({
      actor: session.role,
      action: "settings.update",
      entityType: "settings",
      entityId: "site",
      summary: "Updated site settings",
    });
  });

  if (failure) return failure;

  revalidatePath("/", "layout");

  return { success: "Settings saved." };
}
