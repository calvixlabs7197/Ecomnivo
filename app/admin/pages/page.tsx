import Link from "next/link";
import type { Route } from "next";

import { listPagesForAdmin } from "@/lib/content/pages";
import { firstParam, matchesQuery, resultLabel } from "@/lib/admin/filters";
import { relativeTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { FilterBar } from "@/components/admin/filter-bar";
import {
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  RowTitle,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminPagesPage({ searchParams }: PageProps<"/admin/pages">) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const type = firstParam(params.type);
  const status = firstParam(params.status);

  const pages = await listPagesForAdmin();

  const rows = pages.filter((page) => {
    if (type === "builtin" && !page.isSeed) return false;
    if (type === "custom" && page.isSeed) return false;
    if (status === "published" && !page.isPublished) return false;
    if (status === "hidden" && page.isPublished) return false;
    return matchesQuery(query, page.title, page.slug);
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pages"
        description="About, the legal set, and any page you add. A new page is live at its URL as soon as you save it — there is no rebuild in between."
        meta={
          <span>
            {pages.filter((page) => page.isPublished).length} published of {pages.length}
          </span>
        }
        actions={
          <Link href="/admin/pages/new" className={buttonStyles({ size: "sm" })}>
            New page
          </Link>
        }
      />

      <Panel>
        <FilterBar
          searchPlaceholder="Search pages…"
          resultLabel={resultLabel(rows.length, pages.length, "page")}
          selects={[
            {
              name: "type",
              label: "Type",
              options: [
                { value: "builtin", label: "Built-in" },
                { value: "custom", label: "Custom" },
              ],
            },
            {
              name: "status",
              label: "Status",
              options: [
                { value: "published", label: "Published" },
                { value: "hidden", label: "Hidden" },
              ],
            },
          ]}
        />

        {rows.length === 0 ? (
          <EmptyState
            title="No pages match"
            description="Nothing here matches these filters."
            action={
              <Link href="/admin/pages/new" className={buttonStyles({ size: "sm" })}>
                New page
              </Link>
            }
          />
        ) : (
          <DataTable
            head={
              <>
                <Th>Page</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th align="right">Actions</Th>
              </>
            }
            minWidth="48rem"
          >
            {rows.map((page) => (
              <tr key={page.slug}>
                <Td>
                  <RowTitle
                    title={page.title}
                    path={`/${page.slug}`}
                    href={`/admin/pages/${page.slug}` as Route}
                  />
                </Td>
                <Td className="text-muted">{page.isSeed ? "Built-in" : "Custom"}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {page.isPublished ? (
                      <Badge tone="positive">Published</Badge>
                    ) : (
                      <Badge tone="caution">Hidden</Badge>
                    )}
                    {page.isIndexable === false ? <Badge tone="caution">noindex</Badge> : null}
                  </div>
                </Td>
                <Td className="text-muted">{relativeTime(page.updatedAt)}</Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-3">
                    {page.isPublished ? (
                      <Link
                        href={`/${page.slug}` as Route}
                        className="text-sm font-medium text-muted hover:text-ink"
                      >
                        View
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/pages/${page.slug}` as Route}
                      className="text-sm font-medium text-brand hover:text-brand-hover"
                    >
                      Edit
                    </Link>
                  </div>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
