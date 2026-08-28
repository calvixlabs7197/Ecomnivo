import type { Metadata } from "next";

import { resolveCategories } from "@/lib/categories/resolve";
import { listToolsByCategory, resolveTools } from "@/lib/tools/resolve";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema, type Crumb } from "@/lib/seo/jsonld";

import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/layout/page-hero";
import { ToolGrid } from "@/components/tools/tool-grid";
import { JsonLd } from "@/components/seo/json-ld";

const title = "Free Ecommerce Calculators for US Sellers";
const description =
  "USD-first ecommerce calculators for US sellers: profit, ROAS, advertising, pricing, fees and growth tools. Free to use with no signup.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/tools",
});

const crumbs: Crumb[] = [
  { name: "Home", href: "/" },
  { name: "Tools" },
];

export default async function ToolsPage() {
  const allTools = await resolveTools();
  const liveCount = allTools.filter((tool) => tool.status === "live").length;
  const categories = await resolveCategories();
  const byCategory = await Promise.all(
    categories.map(async (category) => ({
      category,
      tools: (await listToolsByCategory(category.slug)).filter((tool) => tool.status === "live"),
    })),
  );

  return (
    <>
      <PageHero
        crumbs={crumbs}
        title={title}
        lead={`${liveCount} USD-first calculators for US online sellers, covering the numbers that decide whether a store makes money. Each one shows its formula and a worked example, so you can verify the math.`}
      >
        {liveCount === 0 ? (
          <p className="leading-relaxed text-muted">
            The calculators are being built and released in order of how often sellers
            need them. Nothing is listed as ready until its formula is verified and
            tested.
          </p>
        ) : null}
      </PageHero>

      <Container className="pb-20">
        <div className="flex flex-col gap-14">
          {byCategory.map(({ category, tools }) => {
            const headingId = `category-${category.slug}`;

            return (
              <section key={category.slug} aria-labelledby={headingId}>
                <div className="mb-6 border-b border-rule pb-4">
                  <h2 id={headingId} className="text-h2">
                    {category.name}
                  </h2>
                  <p className="mt-2 max-w-reading text-muted">{category.tagline}</p>
                </div>
                <ToolGrid tools={tools} />
              </section>
            );
          })}
        </div>
      </Container>

      <JsonLd
        data={[
          collectionPageSchema({ name: title, description, path: "/tools" }),
          breadcrumbSchema(crumbs),
        ]}
      />
    </>
  );
}
