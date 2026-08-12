import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";

import { getGuide, listGuides } from "@/lib/content/guides";
import { getTool } from "@/lib/tools/catalog";
import type { ToolSummary } from "@/lib/tools/types";
import { readingMinutes } from "@/lib/content/reading-time";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema, type Crumb } from "@/lib/seo/jsonld";

import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MarkdownContent } from "@/components/content/markdown";
import { GuideCard } from "@/components/content/guide-card";
import { ToolGrid } from "@/components/tools/tool-grid";
import { AdSlot } from "@/components/monetization/ad-slot";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateStaticParams() {
  return (await listGuides()).map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    return buildMetadata({
      title: "Guide not found",
      description: "This guide does not exist.",
      path: "/guides",
      noindex: true,
    });
  }

  return buildMetadata({
    title: guide.seoTitle ?? guide.title,
    absoluteTitle: Boolean(guide.seoTitle),
    description: guide.seoDescription ?? guide.excerpt,
    path: `/guides/${guide.slug}`,
    noindex: !guide.isIndexable,
    type: "article",
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
  });
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) notFound();

  const minutes = readingMinutes(guide.contentMd);
  const relatedTools = guide.relatedTools
    .map((toolSlug) => getTool(toolSlug))
    .filter((tool): tool is ToolSummary => Boolean(tool));

  const otherGuides = (await listGuides())
    .filter((candidate) => candidate.slug !== guide.slug)
    .slice(0, 3);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides" },
    { name: guide.title },
  ];

  return (
    <>
      <Container className="py-8 sm:py-12">
        <Breadcrumbs crumbs={crumbs} />

        <article>
          <header className="mt-6 max-w-reading">
            <p className="text-eyebrow uppercase text-brand">{guide.category}</p>
            <h1 className="mt-3 text-h1">{guide.title}</h1>
            <p className="mt-4 text-lead leading-relaxed text-muted">{guide.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-rule pt-4 text-sm text-muted">
              <span>By {guide.author.name}</span>
              <span aria-hidden="true" className="text-rule-strong">
                &middot;
              </span>
              <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
              {guide.updatedAt !== guide.publishedAt ? (
                <>
                  <span aria-hidden="true" className="text-rule-strong">
                    &middot;
                  </span>
                  <span>
                    Updated <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time>
                  </span>
                </>
              ) : null}
              <span aria-hidden="true" className="text-rule-strong">
                &middot;
              </span>
              <span>{minutes} min read</span>
            </div>
          </header>

          <div className="mt-10">
            <MarkdownContent content={guide.contentMd} />
          </div>
        </article>
      </Container>

      <AdSlot placement="in-content" />

      {relatedTools.length > 0 ? (
        <section
          aria-labelledby="guide-tools"
          className="border-t border-rule bg-surface py-16"
        >
          <Container>
            <div className="mb-8 max-w-reading">
              <h2 id="guide-tools" className="text-h2">
                Tools from this guide
              </h2>
              <p className="mt-2 leading-relaxed text-muted">
                Run the numbers from this article on your own figures.
              </p>
            </div>
            <ToolGrid tools={relatedTools} />
          </Container>
        </section>
      ) : null}

      {otherGuides.length > 0 ? (
        <section aria-labelledby="more-guides" className="py-16">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 id="more-guides" className="text-h2">
                More guides
              </h2>
              <Link
                href={"/guides" as Route}
                className="text-sm font-medium text-brand transition-colors duration-150 ease-soft hover:text-brand-hover"
              >
                All guides
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherGuides.map((other) => (
                <li key={other.slug} className="h-full">
                  <GuideCard guide={other} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          articleSchema({
            title: guide.title,
            description: guide.seoDescription ?? guide.excerpt,
            path: `/guides/${guide.slug}`,
            authorName: guide.author.name,
            publishedAt: guide.publishedAt,
            updatedAt: guide.updatedAt,
          }),
          breadcrumbSchema(crumbs),
        ]}
      />
    </>
  );
}
