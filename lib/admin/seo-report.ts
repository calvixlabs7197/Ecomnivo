import "server-only";

import { resolveTools } from "@/lib/tools/resolve";
import { getToolContent } from "@/lib/tools/registry";
import { listGuidesForAdmin } from "@/lib/content/guides";
import { listPagesForAdmin } from "@/lib/content/pages";
import { resolveCategories } from "@/lib/categories/resolve";
import {
  auditSubjects,
  countWords,
  summariseIssues,
  type SeoIssue,
  type SeoSubject,
  type SeoSummary,
} from "@/lib/seo/audit";

/**
 * Feeds the audit with what the site will actually serve.
 *
 * The important word is *actually*: each subject's title and description are
 * built by applying the same fallback chain the route applies, so the report
 * grades the tag a crawler would see rather than the field an editor left
 * blank. A tool with no SEO title override is not missing a title — it is
 * using the one written next to the calculator, and the audit has to know that
 * to avoid crying wolf on every row.
 */
export interface SeoReport {
  subjects: SeoSubject[];
  issues: SeoIssue[];
  summary: SeoSummary;
}

export async function buildSeoReport(): Promise<SeoReport> {
  const [tools, guides, pages, categories] = await Promise.all([
    resolveTools(),
    listGuidesForAdmin(),
    listPagesForAdmin(),
    resolveCategories(),
  ]);

  const toolSubjects: SeoSubject[] = tools.map((tool) => {
    const content = getToolContent(tool.slug);
    return {
      entity: "tool",
      slug: tool.slug,
      name: tool.name,
      publicPath: tool.status === "live" ? `/tools/${tool.slug}` : null,
      title: tool.seoTitleOverride ?? content?.seo.title ?? tool.name,
      description: tool.seoDescriptionOverride ?? content?.seo.description ?? "",
      indexable: true,
      published: tool.status === "live",
    };
  });

  const guideSubjects: SeoSubject[] = guides.map((guide) => ({
    entity: "guide",
    slug: guide.slug,
    name: guide.title,
    publicPath: guide.isVisible ? `/guides/${guide.slug}` : null,
    title: guide.seoTitle ?? guide.title,
    description: guide.seoDescription ?? guide.excerpt,
    indexable: guide.isIndexable,
    published: guide.isVisible,
    words: countWords(guide.contentMd),
  }));

  const pageSubjects: SeoSubject[] = pages.map((page) => ({
    entity: "page",
    slug: page.slug,
    name: page.title,
    publicPath: page.isPublished ? `/${page.slug}` : null,
    title: page.seoTitle ?? page.title,
    // The route falls back to an empty description, so an unset field really
    // does ship a page with no meta description. Mirrored, not papered over.
    description: page.seoDescription ?? "",
    indexable: page.isIndexable !== false,
    published: page.isPublished,
    words: countWords(page.contentMd),
  }));

  const categorySubjects: SeoSubject[] = categories.map((category) => ({
    entity: "category",
    slug: category.slug,
    name: category.name,
    publicPath: `/categories/${category.slug}`,
    title: category.seoTitle ?? `${category.name} Calculators`,
    description: category.seoDescription ?? category.description,
    indexable: true,
    published: true,
  }));

  const subjects = [
    ...toolSubjects,
    ...guideSubjects,
    ...pageSubjects,
    ...categorySubjects,
  ];

  const issues = auditSubjects(subjects);

  return { subjects, issues, summary: summariseIssues(subjects, issues) };
}
