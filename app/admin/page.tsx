import Link from "next/link";
import type { Route } from "next";

import { resolveTools } from "@/lib/tools/resolve";
import { listGuideRecords, listActivity } from "@/lib/db/repositories";
import { listGuides } from "@/lib/content/guides";
import { listPages } from "@/lib/content/pages";
import { Card } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [tools, guides, guideRecords, pages, activity] = await Promise.all([
    resolveTools(),
    listGuides(),
    listGuideRecords(),
    listPages(),
    listActivity(),
  ]);

  const published = tools.filter((tool) => tool.status === "live").length;
  const drafts = guideRecords.filter((record) => record.status !== "published").length;

  const stats = [
    { label: "Calculators live", value: published, href: "/admin/tools" },
    { label: "Calculators hidden", value: tools.length - published, href: "/admin/tools" },
    { label: "Guides published", value: guides.length, href: "/admin/guides" },
    { label: "Guides in draft", value: drafts, href: "/admin/guides" },
    { label: "Pages", value: pages.length, href: "/admin/pages" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h2">Dashboard</h1>
        <p className="mt-2 text-muted">Everything published on the site, at a glance.</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href as Route} className="block rounded-lg">
              <Card interactive className="bg-page">
                <div className="p-5">
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="mt-1 text-4xl font-bold tabular-nums text-ink">{stat.value}</p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-activity">
        <h2 id="recent-activity" className="text-h3">
          Recent activity
        </h2>

        {activity.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-rule-strong bg-page p-6 text-sm text-muted">
            Nothing yet. Every change made in here is recorded, and the log cannot be
            edited or deleted from the interface.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-rule rounded-lg border border-rule bg-page">
            {activity.slice(0, 12).map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 p-4">
                <span className="font-mono text-xs text-muted">{entry.action}</span>
                <span className="text-sm text-ink">{entry.summary}</span>
                <time
                  dateTime={entry.createdAt}
                  className="ml-auto text-xs tabular-nums text-muted"
                >
                  {new Date(entry.createdAt).toLocaleString("en-GB")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
