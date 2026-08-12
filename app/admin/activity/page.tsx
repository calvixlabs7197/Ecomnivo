import { listActivity } from "@/lib/db/repositories";

export default async function AdminActivityPage() {
  const activity = await listActivity();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h2">Activity</h1>
        <p className="mt-2 max-w-reading leading-relaxed text-muted">
          Every change made in the admin, newest first. The log is append-only — nothing
          in this interface can edit or delete an entry, which is the point of keeping it.
        </p>
      </div>

      {activity.length === 0 ? (
        <p className="rounded-lg border border-dashed border-rule-strong bg-page p-6 text-sm text-muted">
          No activity recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-rule rounded-lg border border-rule bg-page">
          {activity.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 p-4">
              <span className="font-mono text-xs text-muted">{entry.action}</span>
              <span className="text-sm text-ink">{entry.summary}</span>
              <span className="text-xs text-muted">by {entry.actor}</span>
              <time dateTime={entry.createdAt} className="ml-auto text-xs tabular-nums text-muted">
                {new Date(entry.createdAt).toLocaleString("en-GB")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
