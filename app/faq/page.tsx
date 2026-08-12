import Link from "next/link";
import type { Metadata } from "next";

import { siteFaqs } from "@/config/faqs";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema, type Crumb } from "@/lib/seo/jsonld";

import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Accordion } from "@/components/ui/accordion";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

const title = "Frequently Asked Questions";
const description =
  "Answers about EcomNivo's calculators: what they cost, how accurate they are, how currencies work, and what happens to your data.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/faq" });

const crumbs: Crumb[] = [{ name: "Home", href: "/" }, { name: "FAQ" }];

export default function FaqPage() {
  return (
    <>
      <Container className="py-10 sm:py-14">
        <Breadcrumbs crumbs={crumbs} />
        <div className="mt-6 max-w-reading">
          <h1 className="text-h1">{title}</h1>
          <p className="mt-4 text-lead leading-relaxed text-muted">{description}</p>
        </div>
      </Container>

      <Container className="pb-16">
        <div className="max-w-reading">
          <Accordion items={siteFaqs} />
        </div>
      </Container>

      <Container className="pb-24">
        <div className="max-w-reading rounded-lg border border-rule bg-surface p-6">
          <h2 className="text-h3">Still looking for something?</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Each tool page answers the questions specific to that metric, including the
            mistakes it invites and how to read the result.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools" className={buttonStyles({ size: "sm" })}>
              Browse all tools
            </Link>
            <Link
              href="/guides"
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              Read the guides
            </Link>
          </div>
        </div>
      </Container>

      <JsonLd data={[faqSchema(siteFaqs), breadcrumbSchema(crumbs)]} />
    </>
  );
}
