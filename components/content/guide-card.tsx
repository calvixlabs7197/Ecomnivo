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
      <Card interactive className="h-full">
        <div className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <Heading className="text-h3 text-ink">{guide.title}</Heading>
            <ArrowRight
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-muted transition-transform duration-150 ease-soft group-hover:translate-x-0.5 group-hover:text-brand"
            />
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
