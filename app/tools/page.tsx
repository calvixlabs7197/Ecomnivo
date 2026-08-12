import type { Metadata } from "next";

import { categories } from "@/config/categories";
import { listToolsByCategory, resolveTools } from "@/lib/tools/resolve";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema, type Crumb } from "@/lib/seo/jsonld";

import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolGrid } from "@/components/tools/tool-grid";
import { JsonLd } from "@/components/seo/json-ld";

const title = "All E-commerce Calculators and Tools";
const description =
  "Every EcomNivo calculator in one place: profitability, advertising, pricing and growth tools for online sellers. Free, no signup.";

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
  const byCategory = await Promise.all(
    categories.map(async (category) => ({
      category,
      tools: (await listToolsByCategory(category.slug)).filter((tool) => tool.status === "live"),
    })),
  );

  return (
    <>
      <Container className="py-10 sm:py-14">
        <Breadcrumbs crumbs={crumbs} />

        <div className="mt-6 max-w-reading">
          <h1 className="text-h1">{title}</h1>
          <p className="mt-4 text-lead leading-relaxed text-muted">
            {liveCount} calculators covering the numbers that decide whether an
            online store makes money. Each one shows its formula and a worked example, so
            you can check the maths rather than trust it.
          </p>
          {liveCount === 0 ? (
            <p className="mt-4 leading-relaxed text-muted">
              The calculators are being built and released in order of how often sellers
              need them. Nothing is listed as ready until its formula is verified and
              tested.
            </p>
          ) : null}
        </div>
      </Container>

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
