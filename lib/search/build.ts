import "server-only";
import { categories } from "@/config/categories";
import { listPublishedTools } from "@/lib/tools/resolve";
import { listIndexableGuides } from "@/lib/content/guides";
import type { SearchDoc } from "@/lib/search";

/**
 * Builds the search index on the server.
 *
 * It is then handed to the client component as a prop. At around thirty
 * documents of titles, one-line descriptions and a few keywords that is a few
 * kilobytes — small enough that searching is instant with no network round
 * trip and no service to run, and it reflects whatever the admin has
 * published because it is built per request rather than baked in at import
 * time.
 *
 * If the catalogue ever grows past a few hundred entries this stops being the
 * right answer, and the replacement is Postgres full-text search behind an API
 * route. It is not that yet.
 */
export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const [tools, guides] = await Promise.all([listPublishedTools(), listIndexableGuides()]);

  const toolDocs: SearchDoc[] = tools.map((tool) => {
    const category = categories.find((candidate) => candidate.slug === tool.category);
    return {
      kind: "tool",
      title: tool.name,
      description: tool.shortDescription,
      href: `/tools/${tool.slug}`,
      keywords: `${tool.slug} ${category?.name ?? ""} calculator`,
    };
  });

  const guideDocs: SearchDoc[] = guides.map((guide) => ({
    kind: "guide",
    title: guide.title,
    description: guide.excerpt,
    href: `/guides/${guide.slug}`,
    keywords: `${guide.slug} ${guide.category} ${guide.tags.join(" ")}`,
  }));

  const categoryDocs: SearchDoc[] = categories.map((category) => ({
    kind: "category",
    title: `${category.name} calculators`,
    description: category.tagline,
    href: `/categories/${category.slug}`,
    keywords: `${category.slug} category`,
  }));

  return [...toolDocs, ...guideDocs, ...categoryDocs];
}
