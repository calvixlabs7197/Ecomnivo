import "server-only";
import type { GuideDoc } from "@/lib/content/types";
import { getTool } from "@/lib/tools/catalog";
import { listGuideRecords } from "@/lib/db/repositories";

import { markupVsMargin } from "@/content/guides/markup-vs-margin";
import { breakEvenRoasExplained } from "@/content/guides/break-even-roas-explained";
import { threeLeversOfEcommerceRevenue } from "@/content/guides/three-levers-of-ecommerce-revenue";

/**
 * The guide source: admin store first, code seeds underneath.
 *
 * A stored record wins outright for its slug, and the admin can add guides
 * that exist nowhere in code. The seeds remain so the site has real content on
 * a fresh clone with an empty store — §0 decision 2 in practice.
 *
 * Everything here is async because the store is. Swapping the JSON files for
 * Supabase changes `listGuideRecords()` and nothing else.
 */
const seeds: readonly GuideDoc[] = [
  markupVsMargin,
  breakEvenRoasExplained,
  threeLeversOfEcommerceRevenue,
];

/** Seed slugs, so the admin can tell built-in content from its own. */
export const seedGuideSlugs = new Set(seeds.map((guide) => guide.slug));

function isVisible(record: { status: string; publishedAt: string }): boolean {
  if (record.status !== "published") return false;
  // A scheduled-then-published guide should not appear before its date.
  return new Date(record.publishedAt).getTime() <= Date.now();
}

/** Everything the public site may show, newest first. */
export async function listGuides(): Promise<GuideDoc[]> {
  const records = await listGuideRecords();
  const overridden = new Set(records.map((record) => record.slug));

  const fromStore: GuideDoc[] = records.filter(isVisible).map((record) => ({
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    contentMd: record.contentMd,
    category: record.category,
    tags: record.tags,
    author: record.author,
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt,
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    canonicalUrl: record.canonicalUrl,
    isIndexable: record.isIndexable,
    relatedTools: record.relatedTools,
  }));

  const fromSeeds = seeds.filter((guide) => !overridden.has(guide.slug));

  return [...fromStore, ...fromSeeds].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getGuide(slug: string): Promise<GuideDoc | undefined> {
  return (await listGuides()).find((guide) => guide.slug === slug);
}

/** Indexable guides only — what belongs in the sitemap. */
export async function listIndexableGuides(): Promise<GuideDoc[]> {
  return (await listGuides()).filter((guide) => guide.isIndexable);
}

/**
 * Guides that explain a given tool.
 *
 * The relationship is declared once, on the guide, and read from both ends.
 * Storing it on both would mean keeping two lists in sync by hand, and they
 * would drift the first time someone was in a hurry.
 */
export async function getGuidesForTool(toolSlug: string): Promise<GuideDoc[]> {
  return (await listGuides()).filter((guide) => guide.relatedTools.includes(toolSlug));
}

// ---------------------------------------------------------------------------
// Seed invariants. Store records are validated on save instead, where a bad
// value can be reported to the person who typed it.
// ---------------------------------------------------------------------------

const problems: string[] = [];

const slugs = seeds.map((guide) => guide.slug);
const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
if (duplicates.length > 0) {
  problems.push(`Duplicate guide slugs: ${[...new Set(duplicates)].join(", ")}`);
}

for (const guide of seeds) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(guide.slug)) {
    problems.push(`Guide slug "${guide.slug}" is not URL-safe.`);
  }
  if (Number.isNaN(new Date(guide.publishedAt).getTime())) {
    problems.push(`Guide "${guide.slug}" has an unparseable publishedAt.`);
  }
  for (const toolSlug of guide.relatedTools) {
    if (!getTool(toolSlug)) {
      problems.push(`Guide "${guide.slug}" links to unknown tool "${toolSlug}".`);
    }
  }
}

if (problems.length > 0) {
  throw new Error(`Guide content is inconsistent:\n${problems.map((p) => `  · ${p}`).join("\n")}`);
}
