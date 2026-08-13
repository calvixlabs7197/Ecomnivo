import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import type { GuideDoc } from "@/lib/content/types";
import { readingMinutes } from "@/lib/content/reading-time";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * `headingLevel` for the same reason as ToolCard: on /guides these cards are
 * the page's top-level content (h2), while on the homepage and at the foot of
 * a guide they sit under a section heading (h3). The visual size is unchanged
 * either way — heading level is document structure, not type scale.
 */
export function GuideCard({
  guide,
  headingLevel = 3,
}: {
  guide: GuideDoc;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const minutes = readingMinutes(guide.contentMd);
  const published = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(guide.publishedAt));

  return (
    <Link href={`/guides/${guide.slug}` as Route} className="group block h-full rounded-lg">
      <Card interactive className="lift sheen h-full">
        <div className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <Heading className="text-h3 text-ink transition-colors duration-200 ease-soft group-hover:text-brand-hover">
              {guide.title}
            </Heading>
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition-all duration-200 ease-soft group-hover:bg-brand-tint group-hover:text-brand">
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 ease-soft group-hover:translate-x-0.5"
              />
            </span>
          </div>

          <p className="text-sm leading-relaxed text-muted">{guide.excerpt}</p>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-sm text-muted">
            <Badge>{guide.category}</Badge>
            <time dateTime={guide.publishedAt}>{published}</time>
            <span aria-hidden="true" className="text-rule-strong">
              &middot;
            </span>
            <span>{minutes} min read</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
