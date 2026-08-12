import type { MetadataRoute } from "next";
import { categories } from "@/config/categories";
import { listPublishedTools } from "@/lib/tools/resolve";
import { listIndexableGuides } from "@/lib/content/guides";
import { listIndexablePages } from "@/lib/content/pages";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * The sitemap contains indexable pages only.
 *
 * Excluded on purpose:
 *  · /search — noindex, and disallowed in robots.txt
 *  · guides or pages the admin marked non-indexable, unpublished or draft
 *  · tools the admin unpublished, and tools with no implementation
 *
 * A sitemap that lists URLs which are noindex, 404, or thin is a crawl-budget
 * problem, not a bonus.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [tools, guides, pages] = await Promise.all([
    listPublishedTools(),
    listIndexableGuides(),
    listIndexablePages(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tools"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/guides"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    {
      url: absoluteUrl("/categories"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: absoluteUrl("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/categories/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: absoluteUrl(`/tools/${tool.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Real edit dates, not the build time — a lastmod that changes on every
  // deploy teaches crawlers to ignore the field.
  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: absoluteUrl(`/${page.slug}`),
    lastModified: new Date(page.updatedAt),
    changeFrequency: "yearly",
    priority: page.slug === "about" ? 0.4 : 0.2,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...toolRoutes,
    ...guideRoutes,
    ...pageRoutes,
  ];
}
