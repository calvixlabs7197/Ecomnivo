import "server-only";
import { cache } from "react";
import type { LucideIcon } from "lucide-react";

import { categories, type Category, type CategorySlug } from "@/config/categories";
import { getIcon } from "@/config/icons";
import { listCategoryRecords } from "@/lib/db/repositories";

/**
 * Merges the four code-defined categories with admin overrides.
 *
 * The same contract as `lib/tools/resolve.ts`: code decides what exists, the
 * store decides how it reads. A category cannot be created or deleted from the
 * admin, because its slug is a route, its tools are assigned to it by slug, and
 * `CategorySlug` is a union the compiler checks. Renaming one is a content
 * edit; removing one is a redirect plan, and that is a code change.
 */
export interface ResolvedCategory {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  iconName?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  /** True when an admin has edited this category away from its code defaults. */
  isCustomised: boolean;
  updatedAt?: string;
}

function merge(category: Category, index: number, record?: {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}): ResolvedCategory {
  return {
    slug: category.slug,
    name: record?.name || category.name,
    tagline: record?.tagline || category.tagline,
    description: record?.description || category.description,
    icon: getIcon(record?.icon, category.icon),
    iconName: record?.icon,
    seoTitle: record?.seoTitle,
    seoDescription: record?.seoDescription,
    sortOrder: record?.sortOrder ?? index,
    isCustomised: Boolean(record),
    updatedAt: record?.updatedAt,
  };
}

/**
 * Memoised per request.
 *
 * A category name appears on every tool card, so a listing page would otherwise
 * read the same JSON file thirty times to render one grid. `cache` collapses
 * that to one read per request without any component having to thread the
 * value down through props it does not otherwise need.
 */
export const resolveCategories = cache(async (): Promise<ResolvedCategory[]> => {
  const records = await listCategoryRecords();
  const bySlug = new Map(records.map((record) => [record.slug, record]));

  return categories
    .map((category, index) => merge(category, index, bySlug.get(category.slug)))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
});

export async function resolveCategory(slug: string): Promise<ResolvedCategory | undefined> {
  return (await resolveCategories()).find((category) => category.slug === slug);
}
