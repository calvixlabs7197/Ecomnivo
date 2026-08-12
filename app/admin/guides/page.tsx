import Link from "next/link";
import type { Route } from "next";

import { listGuides, seedGuideSlugs } from "@/lib/content/guides";
import { listGuideRecords } from "@/lib/db/repositories";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";

export default async function AdminGuidesPage() {
  const [published, records] = await Promise.all([listGuides(), listGuideRecords()]);

  // Drafts are invisible to `listGuides`, so the admin list is the union: every
  // record plus any built-in guide that has not been overridden yet.
  const overridden = new Set(records.map((record) => record.slug));
  const rows = [
    ...records.map((record) => ({
      slug: record.slug,
      title: record.title,
      status: record.status,
      updatedAt: record.updatedAt,
      isSeed: seedGuideSlugs.has(record.slug),
    })),
    ...published
      .filter((guide) => !overridden.has(guide.slug))
      .map((guide) => ({
        slug: guide.slug,
        title: guide.title,
        status: "published" as const,
        updatedAt: guide.updatedAt,
        isSeed: true,
      })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Guides</h1>
          <p className="mt-2 text-muted">Write, schedule and publish. {rows.length} total.</p>
        </div>
        <Link href="/admin/guides/new" className={buttonStyles({ size: "sm" })}>
          New guide
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-rule bg-page">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Guide</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Updated</th>
              <th scope="col" className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((row) => (
              <tr key={row.slug}>
                <td className="px-4 py-3">
                  <span className="font-medium text-ink">{row.title}</span>
                  <span className="mt-0.5 block font-mono text-xs text-muted">
                    /guides/{row.slug}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.status === "published" ? (
                    <Badge tone="brand">Published</Badge>
                  ) : (
                    <Badge>{row.status === "draft" ? "Draft" : "Scheduled"}</Badge>
                  )}
                  {row.isSeed ? (
                    <span className="ml-2 text-xs text-muted">built-in</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {row.updatedAt.slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/guides/${row.slug}` as Route}
                    className="font-medium text-brand hover:text-brand-hover"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
