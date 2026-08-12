import Link from "next/link";
import type { Route } from "next";

import { listGuidesForAdmin } from "@/lib/content/guides";
import { firstParam, matchesQuery, resultLabel } from "@/lib/admin/filters";
import { formatDate, relativeTime } from "@/lib/admin/format";
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

export default async function AdminGuidesPage({ searchParams }: PageProps<"/admin/guides">) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const status = firstParam(params.status);

  const guides = await listGuidesForAdmin();

  const rows = guides.filter((guide) => {
    if (status && guide.status !== status) return false;
    return matchesQuery(query, guide.title, guide.slug, guide.excerpt, guide.category);
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Guides"
        description="Write, schedule and publish. A guide with a future publish date stays hidden until the date arrives, even when its status is published."
        meta={
          <span>
            {guides.filter((guide) => guide.isVisible).length} live of {guides.length}
          </span>
        }
        actions={
          <Link href="/admin/guides/new" className={buttonStyles({ size: "sm" })}>
            New guide
          </Link>
        }
      />

      <Panel>
        <FilterBar
          searchPlaceholder="Search guides…"
          resultLabel={resultLabel(rows.length, guides.length, "guide")}
          selects={[
            {
              name: "status",
              label: "Status",
              options: [
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "scheduled", label: "Scheduled" },
              ],
            },
          ]}
        />

        {rows.length === 0 ? (
          <EmptyState
            title="No guides match"
            description="Nothing here matches these filters."
            action={
              <Link href="/admin/guides/new" className={buttonStyles({ size: "sm" })}>
                New guide
              </Link>
            }
          />
        ) : (
          <DataTable
            head={
              <>
                <Th>Guide</Th>
                <Th>Status</Th>
                <Th>Published</Th>
                <Th>Updated</Th>
                <Th align="right">Actions</Th>
              </>
            }
            minWidth="52rem"
          >
            {rows.map((guide) => (
              <tr key={guide.slug}>
                <Td>
                  <RowTitle
                    title={guide.title}
                    path={`/guides/${guide.slug}`}
                    href={`/admin/guides/${guide.slug}` as Route}
                  />
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {guide.status === "published" ? (
                      <Badge tone={guide.isVisible ? "positive" : "caution"}>
                        {guide.isVisible ? "Published" : "Awaiting date"}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">
                        {guide.status === "draft" ? "Draft" : "Scheduled"}
                      </Badge>
                    )}
                    {guide.isSeed ? <Badge tone="quiet">built-in</Badge> : null}
                    {!guide.isIndexable ? <Badge tone="caution">noindex</Badge> : null}
                  </div>
                </Td>
                <Td className="tabular-nums text-muted">{formatDate(guide.publishedAt)}</Td>
                <Td className="text-muted">{relativeTime(guide.updatedAt)}</Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-3">
                    {guide.isVisible ? (
                      <Link
                        href={`/guides/${guide.slug}` as Route}
                        className="text-sm font-medium text-muted hover:text-ink"
                      >
                        View
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/guides/${guide.slug}` as Route}
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
