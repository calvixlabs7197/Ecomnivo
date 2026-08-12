import Link from "next/link";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { homeFaqs } from "@/config/faqs";
import { categoryCounts, listFeaturedTools } from "@/lib/tools/resolve";
import { listGuides } from "@/lib/content/guides";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/jsonld";

import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import { Accordion } from "@/components/ui/accordion";
import { buttonStyles } from "@/components/ui/button";
import { Hero } from "@/components/home/hero";
import { WhyEcomNivo } from "@/components/home/why-ecomnivo";
import { ToolGrid } from "@/components/tools/tool-grid";
import { CategoryGrid } from "@/components/categories/category-grid";
import { GuideCard } from "@/components/content/guide-card";
import { AdSlot } from "@/components/monetization/ad-slot";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage() {
  const [featured, guides, counts] = await Promise.all([
    listFeaturedTools(),
    listGuides(),
    categoryCounts(),
  ]);
  const latestGuides = guides.slice(0, 3);

  return (
    <>
      <Hero />

      <Section labelledBy="popular-tools">
        <Container>
          <SectionHeading
            id="popular-tools"
            title="Popular tools"
            description="The calculators most sellers reach for first — profitability, ad performance and pricing."
            action={
              <Link
                href="/tools"
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                View all tools
              </Link>
            }
          />
          <ToolGrid tools={featured} />
        </Container>
      </Section>

      <Section tone="surface" labelledBy="explore-categories">
        <Container>
          <SectionHeading
            id="explore-categories"
            title="Explore by category"
            description="Four areas that decide whether an online store makes money."
          />
          <CategoryGrid counts={counts} />
        </Container>
      </Section>

      <AdSlot placement="leaderboard" />

      <Section labelledBy="why-ecomnivo">
        <Container>
          <SectionHeading
            id="why-ecomnivo"
            title="Why EcomNivo?"
            description="Built to be the calculator you keep open in a tab, not the one you close after one use."
          />
          <WhyEcomNivo />
        </Container>
      </Section>

      <Section labelledBy="latest-guides" className="pt-0 sm:pt-0 lg:pt-0">
        <Container>
          <SectionHeading
            id="latest-guides"
            title="Latest guides"
            description="The reasoning behind the numbers, for when a calculator answers the what but not the why."
            action={
              <Link
                href="/guides"
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                All guides
              </Link>
            }
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestGuides.map((guide) => (
              <li key={guide.slug} className="h-full">
                <GuideCard guide={guide} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="surface" labelledBy="home-faq">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="home-faq" title="Frequently asked questions" />
            <Accordion items={homeFaqs} />
          </div>
        </Container>
      </Section>

      <JsonLd data={faqSchema(homeFaqs)} />
    </>
  );
}
