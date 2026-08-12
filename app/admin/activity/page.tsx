import { listActivity } from "@/lib/db/repositories";
import { firstParam, matchesQuery, resultLabel } from "@/lib/admin/filters";
import { formatDate, formatDateTime, formatTime, relativeTime } from "@/lib/admin/format";
import { FilterBar } from "@/components/admin/filter-bar";
import { Callout, EmptyState, PageHeader, Panel } from "@/components/admin/ui";

/**
 * The audit log.
 *
 * Grouped by day rather than shown as one long list, because the question
 * people bring here is almost always "what changed on the day the page broke",
 * and a flat list makes you scan timestamps to answer it.
 */
export default async function AdminActivityPage({
  searchParams,
}: PageProps<"/admin/activity">) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const type = firstParam(params.type);

  const activity = await listActivity();

  const rows = activity.filter((entry) => {
    if (type && entry.entityType !== type) return false;
    return matchesQuery(query, entry.summary, entry.action, entry.entityId, entry.actor);
  });

  const byDay = rows.reduce<Map<string, typeof rows>>((groups, entry) => {
    const day = entry.createdAt.slice(0, 10);
    groups.set(day, [...(groups.get(day) ?? []), entry]);
    return groups;
  }, new Map());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Activity"
        description="Every change made in the admin, newest first, with who made it and when."
        meta={
          activity[0] ? <span>Last entry {relativeTime(activity[0].createdAt)}</span> : null
        }
      />

      <Panel>
        <FilterBar
          searchPlaceholder="Search the log…"
          resultLabel={resultLabel(rows.length, activity.length, "entry")}
          selects={[
            {
              name: "type",
              label: "Type",
              options: [
                { value: "tool", label: "Calculators" },
                { value: "guide", label: "Guides" },
                { value: "page", label: "Pages" },
                { value: "category", label: "Categories" },
                { value: "settings", label: "Settings" },
                { value: "session", label: "Sign-ins" },
              ],
            },
          ]}
        />

        {rows.length === 0 ? (
          <EmptyState
            title={activity.length === 0 ? "Nothing recorded yet" : "No entries match"}
            description={
              activity.length === 0
                ? "Every change made in here is recorded automatically. The log cannot be edited or deleted from this interface."
                : "Nothing in the log matches these filters."
            }
          />
        ) : (
          <div className="divide-y divide-rule">
            {[...byDay].map(([day, entries]) => (
              <section key={day}>
                <h2 className="bg-surface/60 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {formatDate(day)}
                </h2>
                <ul className="divide-y divide-rule">
                  {entries.map((entry) => (
                    <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3">
                      <span className="font-mono text-xs text-muted">{entry.action}</span>
                      <span className="text-sm text-ink">{entry.summary}</span>
                      <span className="text-xs text-muted">by {entry.actor.replace("_", " ")}</span>
                      <time
                        dateTime={entry.createdAt}
                        title={formatDateTime(entry.createdAt)}
                        className="ml-auto text-xs tabular-nums text-muted"
                      >
                        {formatTime(entry.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Panel>

      <Callout title="Why this log cannot be cleared">
        An audit trail that the people being audited can edit is decoration. Nothing in this
        interface writes to it except the actions themselves, and the Postgres design mirrors
        that: the table has an insert policy and no update or delete policy at all. It keeps
        the most recent 200 entries so the file cannot grow without bound.
      </Callout>
    </div>
  );
}
