import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import type { ToolSummary } from "@/lib/tools/types";
import { getCategory } from "@/config/categories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * A tool card in one of two states.
 *
 * `planned` tools render as an inert card, not a link. There is no
 * `/tools/[slug]` route until Phase 2, and a card that looks clickable but
 * leads to a 404 is worse than one that says plainly it is not ready.
 *
 * `headingLevel` exists because the same card sits at different depths: on a
 * category page the cards are the top-level content (h2), while on /tools and
 * the homepage they sit under a section heading (h3). Hardcoding h3 skipped a
 * level on the category pages. The visual size stays `text-h3` either way —
 * heading level is document structure, not type scale.
 */
export function ToolCard({
  tool,
  headingLevel = 3,
}: {
  tool: ToolSummary;
  headingLevel?: 2 | 3;
}) {
  const category = getCategory(tool.category);
  const Heading = headingLevel === 2 ? "h2" : "h3";

  const body = (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <Heading className="text-h3 text-ink">{tool.name}</Heading>
        {tool.status === "live" ? (
          <ArrowRight
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 text-muted transition-transform duration-150 ease-soft group-hover:translate-x-0.5 group-hover:text-brand"
          />
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-muted">{tool.shortDescription}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        {category ? <Badge>{category.name}</Badge> : null}
        {tool.status === "planned" ? <Badge tone="quiet">Coming soon</Badge> : null}
      </div>
    </div>
  );

  if (tool.status === "live") {
    return (
      <Link href={`/tools/${tool.slug}` as Route} className="group block h-full rounded-lg">
        <Card interactive className="h-full">
          {body}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="h-full border-dashed bg-surface/50">
      {body}
    </Card>
  );
}
