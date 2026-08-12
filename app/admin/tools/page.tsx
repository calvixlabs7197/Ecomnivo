import Link from "next/link";
import type { Route } from "next";

import { requireRole } from "@/lib/auth/guards";
import { resolveTools } from "@/lib/tools/resolve";
import { resolveCategories } from "@/lib/categories/resolve";
import { listToolRecords } from "@/lib/db/repositories";
import { setToolPublished } from "@/actions/admin";
import { firstParam, matchesQuery, resultLabel } from "@/lib/admin/filters";
import { relativeTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/admin/filter-bar";
import {
  Callout,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  RowTitle,
  Td,
  Th,
} from "@/components/admin/ui";

/**
 * Calculators are admin-and-above.
 *
 * An editor writes guides and pages; unpublishing a calculator removes a URL
 * that other sites may link to, which is a different kind of decision.
 */
export default async function AdminToolsPage({ searchParams }: PageProps<"/admin/tools">) {
  await requireRole("admin");

  const params = await searchParams;
  const query = firstParam(params.q);
  const category = firstParam(params.category);
  const status = firstParam(params.status);

  const [tools, categories, records] = await Promise.all([
    resolveTools(),
    resolveCategories(),
    listToolRecords(),
  ]);

  const categoryNames = new Map(categories.map((entry) => [entry.slug, entry.name]));
  const updatedBySlug = new Map(records.map((record) => [record.slug, record.updatedAt]));

  const rows = tools.filter((tool) => {
    if (category && tool.category !== category) return false;
    if (status === "live" && tool.status !== "live") return false;
    if (status === "hidden" && tool.status === "live") return false;
    if (status === "featured" && !tool.featured) return false;
    return matchesQuery(query, tool.name, tool.slug, tool.shortDescription);
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calculators"
        description="Names, descriptions, SEO and visibility for every tool on the site. The maths itself lives in tested code — see the note below."
        meta={<span>{tools.length} in the catalogue</span>}
      />

      <Panel>
        <FilterBar
          searchPlaceholder="Search calculators…"
          resultLabel={resultLabel(rows.length, tools.length, "calculator")}
          selects={[
            {
              name: "category",
              label: "Category",
              options: categories.map((entry) => ({
                value: entry.slug,
                label: entry.name,
              })),
            },
            {
              name: "status",
              label: "Status",
              options: [
                { value: "live", label: "Live" },
                { value: "hidden", label: "Hidden" },
                { value: "featured", label: "Featured" },
              ],
            },
          ]}
        />

        {rows.length === 0 ? (
          <EmptyState
            title="No calculators match"
            description="Nothing in the catalogue matches these filters. Clear them to see all of them again."
          />
        ) : (
          <DataTable
            head={
              <>
                <Th>Calculator</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th align="right">Actions</Th>
              </>
            }
            minWidth="52rem"
          >
            {rows.map((tool) => {
              const updatedAt = updatedBySlug.get(tool.slug);
              const isLive = tool.status === "live";

              return (
                <tr key={tool.slug}>
                  <Td>
                    <RowTitle
                      title={tool.name}
                      path={`/tools/${tool.slug}`}
                      href={`/admin/tools/${tool.slug}` as Route}
                    />
                  </Td>
                  <Td className="text-muted">
                    {categoryNames.get(tool.category) ?? tool.category}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isLive ? (
                        <Badge tone="positive">Live</Badge>
                      ) : (
                        <Badge tone="caution">Hidden</Badge>
                      )}
                      {tool.featured ? <Badge tone="brand">Featured</Badge> : null}
                    </div>
                  </Td>
                  <Td className="text-muted">
                    {updatedAt ? relativeTime(updatedAt) : "Never edited"}
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-3">
                      <form action={setToolPublished}>
                        <input type="hidden" name="slug" value={tool.slug} />
                        <input
                          type="hidden"
                          name="isPublished"
                          value={isLive ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="text-sm font-medium text-muted transition-colors duration-150 ease-soft hover:text-ink"
                        >
                          {isLive ? "Hide" : "Publish"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/tools/${tool.slug}` as Route}
                        className="text-sm font-medium text-brand hover:text-brand-hover"
                      >
                        Edit
                      </Link>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>

      <Callout title="Why can't I add a calculator here?">
        A calculator is a formula, and a formula stored in a database has to be evaluated at
        runtime — which means either an unsafe <code className="font-mono">eval</code> or an
        expression engine nobody can unit-test. Every calculator on this site is a pure
        function with hand-verified tests, because people make pricing decisions with the
        output. Adding one is a small code change plus a test.
      </Callout>
    </div>
  );
}
