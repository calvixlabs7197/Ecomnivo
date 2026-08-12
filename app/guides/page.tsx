import type { Metadata } from "next";

import { listGuides } from "@/lib/content/guides";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema, type Crumb } from "@/lib/seo/jsonld";

import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { GuideCard } from "@/components/content/guide-card";
import { JsonLd } from "@/components/seo/json-ld";

const title = "E-commerce Guides";
const description =
  "Written explanations of the numbers behind the calculators: how each metric works, what a healthy figure looks like, and what to do when yours is not.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/guides" });

const crumbs: Crumb[] = [{ name: "Home", href: "/" }, { name: "Guides" }];

export default async function GuidesPage() {
  const guides = await listGuides();

  return (
    <>
      <Container className="py-10 sm:py-14">
        <Breadcrumbs crumbs={crumbs} />
        <div className="mt-6 max-w-reading">
          <h1 className="text-h1">{title}</h1>
          <p className="mt-4 text-lead leading-relaxed text-muted">{description}</p>
        </div>
      </Container>

      <Container className="pb-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.slug} className="h-full">
              {/* h2: these cards are the page's top-level content, under the h1. */}
              <GuideCard guide={guide} headingLevel={2} />
            </li>
          ))}
        </ul>
      </Container>

      <JsonLd
        data={[
          collectionPageSchema({ name: title, description, path: "/guides" }),
          breadcrumbSchema(crumbs),
        ]}
      />
    </>
  );
}
