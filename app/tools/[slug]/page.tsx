import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { resolveCategory } from "@/lib/categories/resolve";
import { getGuide, getGuidesForTool } from "@/lib/content/guides";
import type { GuideDoc } from "@/lib/content/types";
import { getTool } from "@/lib/tools/catalog";
import { listPublishedTools, resolveTool } from "@/lib/tools/resolve";
import { getToolContent } from "@/lib/tools/registry";
import { getToolEngine } from "@/lib/tools/engines";
import type { ToolSummary } from "@/lib/tools/types";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  faqSchema,
  webApplicationSchema,
  type Crumb,
} from "@/lib/seo/jsonld";

import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Accordion } from "@/components/ui/accordion";
import { ToolRunner } from "@/components/tools/tool-runner";
import { ToolGrid } from "@/components/tools/tool-grid";
import { GuideCard } from "@/components/content/guide-card";
import { AdSlot } from "@/components/monetization/ad-slot";
import { JsonLd } from "@/components/seo/json-ld";

/** Only tools that are actually implemented get a route. Anything else 404s. */
export async function generateStaticParams() {
  return (await listPublishedTools()).map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const summary = await resolveTool(slug);
  const content = getToolContent(slug);

  if (!summary || !content || summary.status !== "live") {
    return buildMetadata({
      title: "Tool not found",
      description: "This calculator does not exist.",
      path: "/tools",
      noindex: true,
    });
  }

  return buildMetadata({
    title: summary.seoTitleOverride ?? content.seo.title,
    absoluteTitle: true,
    description: summary.seoDescriptionOverride ?? content.seo.description,
    path: `/tools/${slug}`,
  });
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const summary = await resolveTool(slug);
  const content = getToolContent(slug);
  const engine = getToolEngine(slug);

  if (!summary || !content || !engine || summary.status !== "live") notFound();

  const category = await resolveCategory(summary.category);

  const relatedSlugs = summary.relatedToolsOverride ?? content.relatedTools;
  const relatedTools = relatedSlugs
    .map((relatedSlug) => getTool(relatedSlug))
    .filter((tool): tool is ToolSummary => Boolean(tool));

  /**
   * Related guides are normally derived from the guides themselves — each guide
   * declares the tools it explains, so the relationship is stated once. The
   * `relatedGuides` field on the tool is a manual override for when an editor
   * wants a specific selection, and takes precedence when it is non-empty.
   */
  const relatedGuides: GuideDoc[] =
    content.relatedGuides.length > 0
      ? (await Promise.all(content.relatedGuides.map((guideSlug) => getGuide(guideSlug)))).filter(
          (guide): guide is GuideDoc => Boolean(guide),
        )
      : await getGuidesForTool(slug);

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools" },
    ...(category ? [{ name: category.name, href: `/categories/${category.slug}` }] : []),
    { name: summary.name },
  ];

  const exampleFields = engine.fields.map((field) => ({
    label: field.label,
    value: content.example.inputs[field.name],
  }));

  return (
    <>
      <Container className="py-8 sm:py-12">
        <Breadcrumbs crumbs={crumbs} />

        <div className="mt-6 max-w-reading">
          <h1 className="text-h1">{content.h1}</h1>
          <p className="mt-4 text-lead leading-relaxed text-muted">{content.intro}</p>
        </div>
      </Container>

      <Container className="pb-12">
        <ToolRunner slug={slug} toolName={summary.name} category={summary.category} />
      </Container>

      <AdSlot placement="in-content" />

      <Container className="pb-20">
        <div className="flex max-w-reading flex-col gap-12">
          <section aria-labelledby="formula">
            <h2 id="formula" className="text-h2">
              How it is calculated
            </h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-rule bg-surface p-4 font-sans text-sm leading-relaxed text-ink">
              {content.formula.expression}
            </pre>
            <p className="mt-4 leading-relaxed text-muted">{content.formula.explanation}</p>
          </section>

          <section aria-labelledby="worked-example">
            <h2 id="worked-example" className="text-h2">
              Worked example
            </h2>
            <dl className="mt-4 divide-y divide-rule border-y border-rule">
              {exampleFields.map((field) => (
                <div key={field.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-muted">{field.label}</dt>
                  <dd className="text-sm font-medium tabular-nums text-ink">{field.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 leading-relaxed text-muted">{content.example.narrative}</p>
            <p className="mt-3 text-sm text-muted">
              Figures are shown without a currency symbol because the maths is the same in any
              single currency.
            </p>
          </section>

          <section aria-labelledby="interpretation">
            <h2 id="interpretation" className="text-h2">
              How to read your result
            </h2>
            <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 leading-relaxed text-muted marker:text-rule-strong">
              {content.interpretation.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="common-mistakes">
            <h2 id="common-mistakes" className="text-h2">
              Common mistakes
            </h2>
            <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 leading-relaxed text-muted marker:text-rule-strong">
              {content.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tool-faq">
            <h2 id="tool-faq" className="text-h2">
              Frequently asked questions
            </h2>
            <div className="mt-4">
              <Accordion items={content.faqs} />
            </div>
          </section>
        </div>
      </Container>

      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools" className="border-t border-rule bg-surface py-16">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 id="related-tools" className="text-h2">
                Related calculators
              </h2>
              <Link
                href={"/tools" as Route}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors duration-150 ease-soft hover:text-brand-hover"
              >
                All tools
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <ToolGrid tools={relatedTools} />
          </Container>
        </section>
      ) : null}

      {relatedGuides.length > 0 ? (
        <section aria-labelledby="related-guides" className="py-16">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 id="related-guides" className="text-h2">
                Guides that explain this
              </h2>
              <Link
                href={"/guides" as Route}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors duration-150 ease-soft hover:text-brand-hover"
              >
                All guides
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((guide) => (
                <li key={guide.slug} className="h-full">
                  <GuideCard guide={guide} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          webApplicationSchema({
            name: summary.name,
            description: content.seo.description,
            path: `/tools/${slug}`,
          }),
          breadcrumbSchema(crumbs),
          faqSchema(content.faqs),
        ]}
      />
    </>
  );
}
