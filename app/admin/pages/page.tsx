import Link from "next/link";
import type { Route } from "next";

import { listPages, seedPageSlugs } from "@/lib/content/pages";
import { listPageRecords } from "@/lib/db/repositories";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";

export default async function AdminPagesPage() {
  const [pages, records] = await Promise.all([listPages(), listPageRecords()]);
  const recordsBySlug = new Map(records.map((record) => [record.slug, record]));

  const rows = [
    ...pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      updatedAt: page.updatedAt,
      isSeed: seedPageSlugs.has(page.slug),
      isPublished: recordsBySlug.get(page.slug)?.isPublished ?? true,
    })),
    // Unpublished records do not appear in listPages(), but must be editable.
    ...records
      .filter((record) => !record.isPublished)
      .map((record) => ({
        slug: record.slug,
        title: record.title,
        updatedAt: record.updatedAt,
        isSeed: seedPageSlugs.has(record.slug),
        isPublished: false,
      })),
  ].sort((a, b) => a.slug.localeCompare(b.slug));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Pages</h1>
          <p className="mt-2 max-w-reading text-muted">
            About, the legal set, and any page you add. New pages are live at their URL as
            soon as you save.
          </p>
        </div>
        <Link href="/admin/pages/new" className={buttonStyles({ size: "sm" })}>
          New page
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-rule bg-page">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Page</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Type</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Status</th>
              <th scope="col" className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((row) => (
              <tr key={row.slug}>
                <td className="px-4 py-3">
                  <span className="font-medium text-ink">{row.title}</span>
                  <span className="mt-0.5 block font-mono text-xs text-muted">/{row.slug}</span>
                </td>
                <td className="px-4 py-3 text-muted">{row.isSeed ? "Built-in" : "Custom"}</td>
                <td className="px-4 py-3">
                  {row.isPublished ? <Badge tone="brand">Published</Badge> : <Badge>Hidden</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/pages/${row.slug}` as Route}
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
