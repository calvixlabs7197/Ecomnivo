import "server-only";
import { randomUUID } from "node:crypto";

import { readCollection, updateCollection, ReadOnlyStoreError } from "@/lib/db/store";
import type {
  ActivityRecord,
  CategoryRecord,
  GuideRecord,
  PageRecord,
  SettingsRecord,
  ToolRecord,
} from "@/lib/db/types";
import { siteConfig } from "@/config/site";

/**
 * Repositories.
 *
 * Every read falls back to an empty collection, never an error — an unseeded
 * store is the normal first-run state, and the public site composes these
 * records on top of the code defaults rather than depending on them.
 *
 * Swapping to Supabase means reimplementing this file. Nothing above it
 * changes.
 */

// --- tools -------------------------------------------------------------------

export async function listToolRecords(): Promise<ToolRecord[]> {
  return readCollection<ToolRecord[]>("tools", []);
}

export async function getToolRecord(slug: string): Promise<ToolRecord | undefined> {
  return (await listToolRecords()).find((record) => record.slug === slug);
}

export async function upsertToolRecord(record: ToolRecord): Promise<void> {
  await updateCollection<ToolRecord[]>("tools", [], (current) => {
    const next = current.filter((existing) => existing.slug !== record.slug);
    next.push({ ...record, updatedAt: new Date().toISOString() });
    return next.sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
  });
}

/**
 * Drops the overrides for a tool.
 *
 * Nothing is lost: the calculator, its copy and its SEO defaults all live in
 * code, and removing the record is how an admin says "go back to those".
 */
export async function deleteToolRecord(slug: string): Promise<void> {
  await updateCollection<ToolRecord[]>("tools", [], (current) =>
    current.filter((record) => record.slug !== slug),
  );
}

// --- guides ------------------------------------------------------------------

export async function listGuideRecords(): Promise<GuideRecord[]> {
  return readCollection<GuideRecord[]>("guides", []);
}

export async function getGuideRecord(slug: string): Promise<GuideRecord | undefined> {
  return (await listGuideRecords()).find((record) => record.slug === slug);
}

export async function upsertGuideRecord(record: GuideRecord): Promise<void> {
  await updateCollection<GuideRecord[]>("guides", [], (current) => {
    const existing = current.find((candidate) => candidate.slug === record.slug);
    const next = current.filter((candidate) => candidate.slug !== record.slug);
    next.push({ ...record, createdAt: existing?.createdAt ?? record.createdAt });
    return next;
  });
}

export async function deleteGuideRecord(slug: string): Promise<void> {
  await updateCollection<GuideRecord[]>("guides", [], (current) =>
    current.filter((record) => record.slug !== slug),
  );
}

// --- pages -------------------------------------------------------------------

export async function listPageRecords(): Promise<PageRecord[]> {
  return readCollection<PageRecord[]>("pages", []);
}

export async function getPageRecord(slug: string): Promise<PageRecord | undefined> {
  return (await listPageRecords()).find((record) => record.slug === slug);
}

export async function upsertPageRecord(record: PageRecord): Promise<void> {
  await updateCollection<PageRecord[]>("pages", [], (current) => {
    const existing = current.find((candidate) => candidate.slug === record.slug);
    const next = current.filter((candidate) => candidate.slug !== record.slug);
    next.push({ ...record, createdAt: existing?.createdAt ?? record.createdAt });
    return next;
  });
}

export async function deletePageRecord(slug: string): Promise<void> {
  await updateCollection<PageRecord[]>("pages", [], (current) =>
    current.filter((record) => record.slug !== slug),
  );
}

// --- categories --------------------------------------------------------------

export async function listCategoryRecords(): Promise<CategoryRecord[]> {
  return readCollection<CategoryRecord[]>("categories", []);
}

export async function getCategoryRecord(slug: string): Promise<CategoryRecord | undefined> {
  return (await listCategoryRecords()).find((record) => record.slug === slug);
}

export async function upsertCategoryRecord(record: CategoryRecord): Promise<void> {
  await updateCollection<CategoryRecord[]>("categories", [], (current) => {
    const next = current.filter((existing) => existing.slug !== record.slug);
    next.push({ ...record, updatedAt: new Date().toISOString() });
    return next.sort((a, b) => a.sortOrder - b.sortOrder);
  });
}

/** Restores a category to its code defaults. */
export async function deleteCategoryRecord(slug: string): Promise<void> {
  await updateCollection<CategoryRecord[]>("categories", [], (current) =>
    current.filter((record) => record.slug !== slug),
  );
}

// --- settings ----------------------------------------------------------------

export function defaultSettings(): SettingsRecord {
  return {
    siteName: siteConfig.name,
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    contactEmail: siteConfig.contactEmail,
    defaultSeoTitle: `${siteConfig.name} — ${siteConfig.tagline}`,
    defaultSeoDescription: siteConfig.description,
    socials: [],
    ga4MeasurementId: null,
    adClientId: null,
    updatedAt: new Date(0).toISOString(),
  };
}

export async function getSettings(): Promise<SettingsRecord> {
  return readCollection<SettingsRecord>("settings", defaultSettings());
}

export async function saveSettings(record: SettingsRecord): Promise<void> {
  await updateCollection<SettingsRecord>("settings", defaultSettings(), () => ({
    ...record,
    updatedAt: new Date().toISOString(),
  }));
}

// --- activity log ------------------------------------------------------------

const ACTIVITY_LIMIT = 200;

export async function listActivity(): Promise<ActivityRecord[]> {
  return readCollection<ActivityRecord[]>("activity", []);
}

/**
 * Append-only from the application's point of view, and capped so the file
 * cannot grow without bound. Nothing in the admin UI can edit or delete
 * entries — the mirror of the Postgres design, where the log has no update or
 * delete policy at all.
 *
 * **A read-only filesystem is survived, not raised.** The log is a side effect
 * of an action, never its purpose, so failing to write one must not fail the
 * action that caused it. Signing in is the case that proves it: on serverless
 * hosting the audit write is the only write in the whole login path, and
 * letting it throw turned a correct password into a 500 with the session cookie
 * discarded — admin was unreachable in production for exactly this reason.
 *
 * Only `ReadOnlyStoreError` is swallowed, and it is reported to the server log.
 * Every content mutation still fails loudly, because each one writes its own
 * record before it gets here.
 */
export async function logActivity(
  entry: Omit<ActivityRecord, "id" | "createdAt">,
): Promise<void> {
  try {
    await updateCollection<ActivityRecord[]>("activity", [], (current) =>
      [{ ...entry, id: randomUUID(), createdAt: new Date().toISOString() }, ...current].slice(
        0,
        ACTIVITY_LIMIT,
      ),
    );
  } catch (error) {
    if (error instanceof ReadOnlyStoreError) {
      console.warn(
        `Audit entry not recorded (read-only store): ${entry.action} ${entry.entityId}`,
      );
      return;
    }
    throw error;
  }
}
