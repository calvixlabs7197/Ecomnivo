import Link from "next/link";
import type { Route } from "next";

import { requireStaff } from "@/lib/auth/guards";
import { getDashboardMetrics } from "@/lib/admin/metrics";
import { buildSeoReport } from "@/lib/admin/seo-report";
import { storeWritable } from "@/lib/db/store";
import { relativeTime } from "@/lib/admin/format";
import { navFor } from "@/components/admin/nav";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityChart } from "@/components/admin/activity-chart";
import {
  Callout,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  PanelBody,
  StatCard,
  StatGrid,
  Td,
  Th,
} from "@/components/admin/ui";

/**
 * The dashboard answers three questions, in this order: is anything broken, how
 * much is published, and what changed recently.
 *
 * Broken comes first on purpose. A read-only filesystem or a page shipping
 * without a meta description is worth more than another count of things that
 * are already fine, so the tiles sit under the warnings rather than above them.
 */
export default async function AdminDashboard() {
  const session = await requireStaff();

  const [metrics, seo, writable] = await Promise.all([
    getDashboardMetrics(),
    buildSeoReport(),
    storeWritable(),
  ]);

  const blockingIssues = seo.issues.filter((issue) => issue.severity !== "notice");
  const quickLinks = navFor(session.role)
    .flatMap((group) => group.items)
    .filter((item) => item.href !== "/admin");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="What is published, what needs attention, and what changed recently."
        meta={
          metrics.lastChangeAt ? (
            <span>Last change {relativeTime(metrics.lastChangeAt)}</span>
          ) : (
            <span>No changes recorded yet</span>
          )
        }
        actions={
          <Link href="/admin/guides/new" className={buttonStyles({ size: "sm" })}>
            New guide
          </Link>
        }
      />

      {!writable ? (
        <Callout tone="caution" title="Saving is unavailable on this host">
          The content store writes JSON files to <code className="font-mono">data/</code>, and
          this filesystem is read-only — which is normal on serverless hosting. Editing works
          locally and on any host with a persistent disk; production editing needs the
          Supabase backend. Everything below is still accurate, and nothing here will silently
          fail: a save that cannot be written says so.
        </Callout>
      ) : null}

      <StatGrid>
        <li>
          <StatCard
            label="Calculators live"
            value={metrics.tools.live}
            hint={`${metrics.tools.hidden} hidden · ${metrics.tools.featured} featured on the homepage`}
            href="/admin/tools"
          />
        </li>
        <li>
          <StatCard
            label="Guides published"
            value={metrics.guides.published}
            hint={`${metrics.guides.draft} draft · ${metrics.guides.scheduled} scheduled`}
            href="/admin/guides"
          />
        </li>
        <li>
          <StatCard
            label="Pages published"
            value={metrics.pages.published}
            hint={`${metrics.pages.hidden} hidden of ${metrics.pages.total} total`}
            href="/admin/pages"
          />
        </li>
        <li>
          <StatCard
            label="SEO health"
            value={`${seo.summary.score}%`}
            tone={
              seo.summary.critical > 0
                ? "critical"
                : seo.summary.warning > 0
                  ? "caution"
                  : "positive"
            }
            hint={`${seo.summary.clean} of ${seo.summary.subjects} live URLs have no title or description problems`}
            href="/admin/seo"
          />
        </li>
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Needs attention"
          description="Critical and warning-level findings from the SEO audit."
          actions={
            <Link
              href="/admin/seo"
              className="text-sm font-medium text-brand hover:text-brand-hover"
            >
              Full report
            </Link>
          }
        >
          {blockingIssues.length === 0 ? (
            <EmptyState
              title="Nothing outstanding"
              description="Every published URL has a title and a description within the limits search results actually display."
            />
          ) : (
            <ul className="divide-y divide-rule">
              {blockingIssues.slice(0, 6).map((issue) => (
                <li key={issue.id} className="flex items-start gap-3 px-5 py-3">
                  <Badge tone={issue.severity === "critical" ? "critical" : "caution"}>
                    {issue.severity === "critical" ? "Critical" : "Warning"}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{issue.name}</p>
                    <p className="text-sm text-muted">{issue.problem}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {blockingIssues.length > 6 ? (
            <div className="border-t border-rule px-5 py-3 text-sm text-muted">
              And {blockingIssues.length - 6} more.
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Activity"
          description="Every admin change, by day, for the last fortnight."
        >
          <ActivityChart days={metrics.activityByDay} />
        </Panel>
      </div>

      <Panel
        title="Calculators by category"
        description="Live count against how many exist in code."
      >
        <DataTable head={<><Th>Category</Th><Th align="right">Live</Th><Th align="right">Hidden</Th></>} minWidth="24rem">
          {metrics.tools.byCategory.map((category) => (
            <tr key={category.slug}>
              <Td>
                <Link
                  href={`/admin/tools?category=${category.slug}` as Route}
                  className="font-medium text-ink hover:text-brand"
                >
                  {category.name}
                </Link>
              </Td>
              <Td align="right" className="tabular-nums">
                {category.live}
              </Td>
              <Td align="right" className="tabular-nums text-muted">
                {category.total - category.live || "—"}
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Recent activity"
        description="Append-only. Nothing in this interface can edit or delete an entry."
        actions={
          <Link
            href="/admin/activity"
            className="text-sm font-medium text-brand hover:text-brand-hover"
          >
            View all
          </Link>
        }
      >
        {metrics.activity.length === 0 ? (
          <EmptyState
            title="Nothing recorded yet"
            description="Every change made in here is logged with who made it and when."
          />
        ) : (
          <ul className="divide-y divide-rule">
            {metrics.activity.slice(0, 8).map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3"
              >
                <span className="font-mono text-xs text-muted">{entry.action}</span>
                <span className="text-sm text-ink">{entry.summary}</span>
                <time
                  dateTime={entry.createdAt}
                  className="ml-auto text-xs tabular-nums text-muted"
                >
                  {relativeTime(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Everywhere else" description="The rest of the admin, in one place.">
        <PanelBody>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex h-full gap-3 rounded-lg border border-rule p-4 transition-colors duration-150 ease-soft hover:border-rule-strong hover:bg-surface"
                  >
                    <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span>
                      <span className="block text-sm font-medium text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </PanelBody>
      </Panel>
    </div>
  );
}
