import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { collectionStats, storeWritable } from "@/lib/db/store";
import { getSettings } from "@/lib/db/repositories";
import { getDashboardMetrics } from "@/lib/admin/metrics";
import { env, advertisingEnabled, analyticsEnabled } from "@/config/env";
import { siteConfig } from "@/config/site";
import { formatBytes, formatDateTime, relativeTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import {
  Callout,
  DataTable,
  KeyValue,
  PageHeader,
  Panel,
  StatCard,
  StatGrid,
  Td,
  Th,
} from "@/components/admin/ui";

const COLLECTIONS = ["tools", "guides", "pages", "categories", "settings", "activity"];

/**
 * Where the content actually lives, and whether this host will accept a write.
 *
 * Every other screen assumes saving works. This one checks — because the single
 * most confusing failure in this application is a Save button that returns an
 * error on a serverless host, and the fix for that confusion is a screen that
 * says so before you click it.
 */
export default async function AdminSystemPage() {
  await requireRole("admin");

  const [writable, stats, settings, metrics] = await Promise.all([
    storeWritable(),
    collectionStats(COLLECTIONS),
    getSettings(),
    getDashboardMetrics(),
  ]);

  const totalBytes = stats.reduce((sum, stat) => sum + stat.bytes, 0);
  const configured = [analyticsEnabled, advertisingEnabled, Boolean(siteConfig.contactEmail)];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System status"
        description="Storage, environment and configuration — the facts a screen full of content counts cannot tell you."
      />

      <StatGrid>
        <li>
          <StatCard
            label="Content store"
            value={writable ? "Writable" : "Read-only"}
            tone={writable ? "positive" : "caution"}
            hint={writable ? "Saving works on this host." : "Saves will be refused here."}
          />
        </li>
        <li>
          <StatCard
            label="Stored data"
            value={formatBytes(totalBytes)}
            hint={`${stats.filter((stat) => stat.exists).length} of ${stats.length} collections written`}
          />
        </li>
        <li>
          <StatCard
            label="Published URLs"
            value={metrics.tools.live + metrics.guides.published + metrics.pages.published}
            hint="Calculators, guides and pages the public can reach."
          />
        </li>
        <li>
          <StatCard
            label="Integrations set"
            value={`${configured.filter(Boolean).length}/3`}
            hint="Analytics, advertising and a published contact address."
          />
        </li>
      </StatGrid>

      {!writable ? (
        <Callout tone="caution" title="This filesystem will not accept writes">
          Normal on serverless hosting, where the application directory is read-only. Content
          editing works locally and on any host with a persistent disk; in production it needs
          the Supabase backend. Saves fail with an explanation rather than a 500, so nothing
          is silently lost — but nothing is saved either.
        </Callout>
      ) : null}

      <Panel
        title="Collections"
        description="JSON files under data/. Plain text on purpose: reviewable in a diff, and importable into Postgres without a translation layer."
      >
        <DataTable
          head={
            <>
              <Th>Collection</Th>
              <Th>State</Th>
              <Th align="right">Size</Th>
              <Th align="right">Last written</Th>
            </>
          }
          minWidth="40rem"
        >
          {stats.map((stat) => (
            <tr key={stat.collection}>
              <Td>
                <span className="font-mono text-xs text-ink">data/{stat.collection}.json</span>
              </Td>
              <Td>
                {stat.exists ? (
                  <Badge tone="positive">Present</Badge>
                ) : (
                  <Badge tone="neutral">Not written yet</Badge>
                )}
              </Td>
              <Td align="right" className="tabular-nums text-muted">
                {stat.exists ? formatBytes(stat.bytes) : "—"}
              </Td>
              <Td align="right" className="text-muted">
                {stat.updatedAt ? relativeTime(stat.updatedAt) : "—"}
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Runtime">
          <KeyValue
            rows={[
              { label: "Environment", value: process.env.NODE_ENV },
              { label: "Node", value: process.version },
              {
                label: "Site URL",
                value: <span className="font-mono text-xs">{env.SITE_URL}</span>,
              },
              { label: "Storage backend", value: "JSON files (local)" },
              {
                label: "Settings last saved",
                value:
                  settings.updatedAt && new Date(settings.updatedAt).getTime() > 0
                    ? formatDateTime(settings.updatedAt)
                    : "Never — using defaults",
              },
            ]}
          />
        </Panel>

        <Panel title="Integrations">
          <KeyValue
            rows={[
              {
                label: "Analytics (GA4)",
                value: analyticsEnabled ? (
                  <Badge tone="positive">Configured</Badge>
                ) : (
                  <Badge tone="neutral">Off</Badge>
                ),
              },
              {
                label: "Advertising",
                value: advertisingEnabled ? (
                  <Badge tone="positive">Configured</Badge>
                ) : (
                  <Badge tone="neutral">Off</Badge>
                ),
              },
              {
                label: "Contact address",
                value: settings.contactEmail ? (
                  <span className="font-mono text-xs">{settings.contactEmail}</span>
                ) : (
                  <Badge tone="caution">Not set</Badge>
                ),
              },
              {
                label: "Consent required first",
                value: <Badge tone="positive">Yes</Badge>,
              },
            ]}
          />
          <div className="border-t border-rule px-5 py-3">
            <Link
              href="/admin/settings"
              className="text-sm font-medium text-brand hover:text-brand-hover"
            >
              Edit integrations
            </Link>
          </div>
        </Panel>
      </div>

      <Callout title="Why the store is files rather than a database">
        The admin had to be genuinely usable before Supabase was introduced, and the site has
        to render when the database is empty or unreachable — so a non-database source has to
        exist regardless. Writes are atomic (temp file, then rename) and serialised within the
        process, so a crash mid-save cannot truncate a collection and two saves cannot
        interleave. What it cannot do is survive a read-only filesystem, which is exactly what
        the status at the top of this page is telling you.
      </Callout>
    </div>
  );
}
