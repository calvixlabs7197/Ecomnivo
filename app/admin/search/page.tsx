import Link from "next/link";
import type { Route } from "next";

import { buildSearchIndex } from "@/lib/search/build";
import { searchDocs, type SearchKind } from "@/lib/search";
import { firstParam, resultLabel } from "@/lib/admin/filters";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/admin/filter-bar";
import {
  Callout,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  RowTitle,
  StatCard,
  StatGrid,
  Td,
  Th,
} from "@/components/admin/ui";

const kindLabels: Record<SearchKind, string> = {
  tool: "Calculator",
  guide: "Guide",
  category: "Category",
};

/**
 * What on-site search can find, and how it ranks.
 *
 * The index is built per request from published content, so this screen is not
 * a report about search — it is search, running the same `searchDocs` the
 * visitor's browser runs. Typing a query here shows the exact order a visitor
 * would get, which is the only reliable way to answer "why doesn't my new
 * guide come up for X".
 */
export default async function AdminSearchPage({ searchParams }: PageProps<"/admin/search">) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const kind = firstParam(params.kind);

  const index = await buildSearchIndex();

  // With a query this is the ranked result a visitor sees; without one it is
  // the raw index, filtered by substring so the table stays usable.
  const ranked = query ? searchDocs(index, query) : index;
  const rows = ranked.filter((doc) => (kind ? doc.kind === kind : true));

  const counts = index.reduce<Record<string, number>>((totals, doc) => {
    totals[doc.kind] = (totals[doc.kind] ?? 0) + 1;
    return totals;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Search index"
        description="Everything on-site search can return. Built fresh on each request from published content, so it always matches what is live."
      />

      <StatGrid>
        <li>
          <StatCard
            label="Documents indexed"
            value={index.length}
            hint="Roughly a few kilobytes — small enough to search in the browser with no server round trip."
          />
        </li>
        <li>
          <StatCard label="Calculators" value={counts.tool ?? 0} href="/admin/tools" />
        </li>
        <li>
          <StatCard label="Guides" value={counts.guide ?? 0} href="/admin/guides" />
        </li>
        <li>
          <StatCard label="Categories" value={counts.category ?? 0} href="/admin/categories" />
        </li>
      </StatGrid>

      <Panel
        title={query ? `Results for “${query}”` : "The index"}
        description={
          query
            ? "In the order a visitor would see them. Tools win ties, because someone searching this site is usually after a calculator."
            : "Every document, with the hidden keywords that also match it."
        }
      >
        <FilterBar
          searchPlaceholder="Try a search…"
          resultLabel={resultLabel(rows.length, index.length, "document")}
          selects={[
            {
              name: "kind",
              label: "Type",
              options: [
                { value: "tool", label: "Calculators" },
                { value: "guide", label: "Guides" },
                { value: "category", label: "Categories" },
              ],
            },
          ]}
        />

        {rows.length === 0 ? (
          <EmptyState
            title="Nothing matches"
            description={
              query
                ? `A visitor searching “${query}” would see an empty state. If that is wrong, the words they used are missing from the title, description and keywords of the page you expected.`
                : "The index is empty. Publish a calculator or a guide and it appears here."
            }
          />
        ) : (
          <DataTable
            head={
              <>
                {query ? <Th align="right">#</Th> : null}
                <Th>Document</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th>Also matches</Th>
              </>
            }
            minWidth="56rem"
          >
            {rows.map((doc, position) => (
              <tr key={doc.href}>
                {query ? (
                  <Td align="right" className="tabular-nums text-muted">
                    {position + 1}
                  </Td>
                ) : null}
                <Td>
                  <RowTitle title={doc.title} path={doc.href} href={doc.href as Route} />
                </Td>
                <Td>
                  <Badge tone="neutral">{kindLabels[doc.kind]}</Badge>
                </Td>
                <Td className="max-w-sm text-muted">{doc.description}</Td>
                <Td className="font-mono text-xs text-muted">{doc.keywords}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="How ranking works">
          <ul className="flex list-disc flex-col gap-2 px-9 py-4 text-sm leading-relaxed text-muted">
            <li>Every term in the query must match somewhere, or the document is dropped.</li>
            <li>A term at the start of the title scores 5, elsewhere in the title 3.</li>
            <li>A term in the description scores 2, in the hidden keywords 1.</li>
            <li>At equal scores, calculators come before guides, and guides before categories.</li>
            <li>
              No stemming and no fuzzy matching: “calculators” will not match “calculator”.
              Deliberate — tuning either of those properly is more work than this index
              justifies.
            </li>
          </ul>
        </Panel>

        <Panel title="Fixing a missing result">
          <div className="flex flex-col gap-3 px-5 py-4 text-sm leading-relaxed text-muted">
            <p>
              Only published, indexable content is in here. A guide in draft, a calculator you
              hid, or a page marked non-indexable will never be returned.
            </p>
            <p>
              If something is published and still missing, the query used words that are not
              in its title, description or keywords. Editing its short description is usually
              the fix.
            </p>
            <Link
              href="/admin/seo"
              className="font-medium text-brand hover:text-brand-hover"
            >
              See which pages have weak descriptions
            </Link>
          </div>
        </Panel>
      </div>

      <Callout title="When this stops being the right answer">
        The whole index is sent to the browser as a prop, which is the right trade at a few
        dozen documents and the wrong one at a few hundred. Past that, this becomes Postgres
        full-text search behind an API route. The ranking function is already separate from
        the data source, so that swap does not touch the ordering rules above.
      </Callout>
    </div>
  );
}
