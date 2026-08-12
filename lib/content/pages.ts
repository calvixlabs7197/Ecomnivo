import "server-only";
import type { PageDoc } from "@/lib/content/types";
import { aboutPage } from "@/content/pages/about";
import { legalPages } from "@/content/pages/legal";
import { listPageRecords } from "@/lib/db/repositories";

/**
 * The static-page source: admin store first, code seeds underneath.
 *
 * The admin can edit any of the built-in pages and can create entirely new
 * ones, which are served by the `app/[slug]` catch-all route.
 */
const seeds: readonly PageDoc[] = [aboutPage, ...legalPages];

/** Built-in pages. The admin may edit these but must not delete them. */
export const seedPageSlugs = new Set(seeds.map((page) => page.slug));

export async function listPages(): Promise<PageDoc[]> {
  const records = await listPageRecords();
  const overridden = new Set(records.map((record) => record.slug));

  const fromStore: PageDoc[] = records
    .filter((record) => record.isPublished)
    .map((record) => ({
      slug: record.slug,
      title: record.title,
      contentMd: record.contentMd,
      seoTitle: record.seoTitle,
      seoDescription: record.seoDescription,
      updatedAt: record.updatedAt,
      isIndexable: record.isIndexable,
    }));

  const fromSeeds = seeds.filter((page) => !overridden.has(page.slug));

  return [...fromStore, ...fromSeeds];
}

export async function getPage(slug: string): Promise<PageDoc | undefined> {
  return (await listPages()).find((page) => page.slug === slug);
}

export interface AdminPage extends PageDoc {
  isPublished: boolean;
  /** A page that ships in code: editable, never deletable. */
  isSeed: boolean;
}

/**
 * Every page the admin can edit, unpublished ones included.
 *
 * `listPages` omits anything unpublished — correct for the site, wrong for the
 * screen you use to publish it again.
 */
export async function listPagesForAdmin(): Promise<AdminPage[]> {
  const records = await listPageRecords();
  const overridden = new Set(records.map((record) => record.slug));

  const fromStore: AdminPage[] = records.map((record) => ({
    slug: record.slug,
    title: record.title,
    contentMd: record.contentMd,
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    updatedAt: record.updatedAt,
    isIndexable: record.isIndexable,
    isPublished: record.isPublished,
    isSeed: seedPageSlugs.has(record.slug),
  }));

  const fromSeeds: AdminPage[] = seeds
    .filter((page) => !overridden.has(page.slug))
    .map((page) => ({ ...page, isPublished: true, isSeed: true }));

  return [...fromStore, ...fromSeeds].sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Indexable pages only — what belongs in the sitemap. */
export async function listIndexablePages(): Promise<PageDoc[]> {
  return (await listPages()).filter((page) => page.isIndexable !== false);
}

/**
 * Pages that need their own route from the catch-all.
 *
 * The built-in pages have explicit route files, so only admin-created slugs
 * are returned here — otherwise both would try to own the same URL.
 */
export async function listCustomPageSlugs(): Promise<string[]> {
  const records = await listPageRecords();
  return records
    .filter((record) => record.isPublished && !seedPageSlugs.has(record.slug))
    .map((record) => record.slug);
}

const slugs = seeds.map((page) => page.slug);
const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

if (duplicates.length > 0) {
  throw new Error(`Duplicate page slugs: ${[...new Set(duplicates)].join(", ")}`);
}
