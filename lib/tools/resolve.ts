import "server-only";
import type { CategorySlug } from "@/config/categories";
import { toolCatalog } from "@/lib/tools/catalog";
import type { ToolSummary } from "@/lib/tools/types";
import { listToolRecords } from "@/lib/db/repositories";

/**
 * Merges the code catalog with admin overrides.
 *
 * The code is the source of truth for what a tool *is*; the store is the
 * source of truth for how it is presented. A missing record is not an error —
 * it means "no overrides", which is the state of a fresh install
 * (§0 decision 2).
 *
 * Unpublishing in admin removes a tool from listings and the sitemap. It does
 * not delete anything, and the calculator stays in code.
 */
export interface ResolvedTool extends ToolSummary {
  seoTitleOverride?: string;
  seoDescriptionOverride?: string;
  relatedToolsOverride?: string[];
  sortOrder: number;
}

export async function resolveTools(): Promise<ResolvedTool[]> {
  const records = await listToolRecords();
  const bySlug = new Map(records.map((record) => [record.slug, record]));

  return toolCatalog
    .map((tool, index) => {
      const record = bySlug.get(tool.slug);

      return {
        ...tool,
        name: record?.name ?? tool.name,
        shortDescription: record?.shortDescription ?? tool.shortDescription,
        category: (record?.categorySlug ?? tool.category) as CategorySlug,
        status: record?.isPublished === false ? ("planned" as const) : tool.status,
        featured: record?.isFeatured ?? tool.featured,
        seoTitleOverride: record?.seoTitle,
        seoDescriptionOverride: record?.seoDescription,
        relatedToolsOverride:
          record?.relatedTools && record.relatedTools.length > 0
            ? record.relatedTools
            : undefined,
        sortOrder: record?.sortOrder ?? index,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function resolveTool(slug: string): Promise<ResolvedTool | undefined> {
  return (await resolveTools()).find((tool) => tool.slug === slug);
}

/** Only tools that are both implemented and published. */
export async function listPublishedTools(): Promise<ResolvedTool[]> {
  return (await resolveTools()).filter((tool) => tool.status === "live");
}

export async function listToolsByCategory(category: CategorySlug): Promise<ResolvedTool[]> {
  return (await resolveTools()).filter((tool) => tool.category === category);
}

/**
 * Published tool count per category.
 *
 * Computed server-side and passed into `CategoryGrid` as a prop, so the count
 * on a card reflects what the admin has actually published rather than how
 * many calculators happen to exist in code.
 */
export async function categoryCounts(): Promise<Record<string, number>> {
  const tools = await listPublishedTools();

  return tools.reduce<Record<string, number>>((counts, tool) => {
    counts[tool.category] = (counts[tool.category] ?? 0) + 1;
    return counts;
  }, {});
}

export async function listFeaturedTools(): Promise<ResolvedTool[]> {
  const published = await listPublishedTools();
  const featured = published.filter((tool) => tool.featured);
  return (featured.length > 0 ? featured : published).slice(0, 6);
}
