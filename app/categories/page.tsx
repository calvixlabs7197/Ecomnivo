import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema, type Crumb } from "@/lib/seo/jsonld";

import { categoryCounts } from "@/lib/tools/resolve";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/layout/page-hero";
import { CategoryGrid } from "@/components/categories/category-grid";
import { JsonLd } from "@/components/seo/json-ld";

const title = "Tool Categories";
const description =
  "Browse EcomNivo's calculators by what they answer: profitability, advertising performance, pricing, and growth.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/categories",
});

const crumbs: Crumb[] = [{ name: "Home", href: "/" }, { name: "Categories" }];

export default async function CategoriesPage() {
  const counts = await categoryCounts();
  return (
    <>
      <PageHero
        crumbs={crumbs}
        title={title}
        lead="Four questions every online seller ends up asking. Pick the one you are trying to answer."
      />

      <Container className="pb-20">
        {/* h2: the grid is the page's top-level content, directly under the h1. */}
        <CategoryGrid headingLevel={2} counts={counts} />
      </Container>

      <JsonLd
        data={[
          collectionPageSchema({ name: title, description, path: "/categories" }),
          breadcrumbSchema(crumbs),
        ]}
      />
    </>
  );
}
