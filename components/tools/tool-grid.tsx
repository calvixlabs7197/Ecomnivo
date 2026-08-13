import type { ToolSummary } from "@/lib/tools/types";
import { ToolCard } from "@/components/tools/tool-card";

export function ToolGrid({
  tools,
  headingLevel = 3,
}: {
  tools: ReadonlyArray<ToolSummary>;
  /** See ToolCard — pass 2 when the grid is not nested under a section heading. */
  headingLevel?: 2 | 3;
}) {
  return (
    <ul className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.slug} className="reveal animate-delay h-full">
          <ToolCard tool={tool} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
