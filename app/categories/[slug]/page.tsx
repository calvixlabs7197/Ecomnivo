import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";

import { CATEGORY_SLUGS } from "@/config/categories";
import { resolveCategory } from "@/lib/categories/resolve";
import { listToolsByCategory } from "@/lib/tools/resolve";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema, type Crumb } from "@/lib/seo/jsonld";

import { accentChip } from "@/components/categories/accent";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolGrid } from "@/components/tools/tool-grid";
import { AdSlot } from "@/components/monetization/ad-slot";
import { JsonLd } from "@/components/seo/json-ld";

/** All four hubs are prerendered; anything else 404s rather than being generated. */
export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolveCategory(slug);

  if (!category) {
    return buildMetadata({
      title: "Category not found",
      description: "This category does not exist.",
      path: "/categories",
      noindex: true,
    });
  }

  return buildMetadata({
    title: category.seoTitle ?? `${category.name} Calculators`,
    absoluteTitle: Boolean(category.seoTitle),
    description: category.seoDescription ?? category.description,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = await resolveCategory(slug);

  if (!category) notFound();

  const tools = (await listToolsByCategory(category.slug)).filter(
    (tool) => tool.status === "live",
  );
  const Icon = category.icon;

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: category.name },
  ];

  return (
    <>
      <div className="aurora relative border-b border-rule">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs crumbs={crumbs} />

          <div
            className="stagger mt-6 max-w-reading"
            style={{ "--stagger": "80ms" } as CSSProperties}
          >
            <span
              className={cn(
                "animate-scale-in animate-delay inline-flex size-12 items-center justify-center rounded-lg",
                accentChip[category.accent],
              )}
            >
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <h1 className="animate-fade-up animate-delay mt-4 text-h1">
              {category.name} Calculators
            </h1>
            <p className="animate-fade-up animate-delay mt-4 text-lead leading-relaxed text-muted">
              {category.description}
            </p>
          </div>
        </Container>
      </div>

      {/* Bottom spacing lives here, not on the ad slot — the slot renders
          nothing in production until an ad client is configured. */}
      <Container className="pb-16">
        {/* h2: these cards are the page's top-level content, directly under the h1. */}
        <ToolGrid tools={tools} headingLevel={2} />
      </Container>

      <AdSlot placement="in-content" />

      <JsonLd
        data={[
          collectionPageSchema({
            name: `${category.name} Calculators`,
            description: category.description,
            path: `/categories/${category.slug}`,
          }),
          breadcrumbSchema(crumbs),
        ]}
      />
    </>
  );
}
