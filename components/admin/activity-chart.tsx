import type { CSSProperties } from "react";
import type { DayCount } from "@/lib/admin/metrics";
import { cn } from "@/lib/utils";

/**
 * Admin changes per day, for the last fortnight.
 *
 * One series, so no legend and no colour coding — the heading names what the
 * bars are, and a second hue would only be decoration. Days with nothing in
 * them keep a visible stub rather than disappearing, because a gap in a bar
 * chart reads as missing data rather than as a quiet day.
 *
 * The numbers are also published as a table for screen readers, since a row of
 * `div`s scaled by percentage height says nothing out loud on its own.
 */
export function ActivityChart({ days }: { days: readonly DayCount[] }) {
  const peak = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <figure className="px-5 py-4">
      <figcaption className="sr-only">
        Admin changes per day over the last {days.length} days
      </figcaption>

      {/*
        Bars grow from the baseline on first paint, left to right. `scaleY` on
        an element anchored to the bottom, so it composites — animating the
        height itself would relayout the row fourteen times per frame.
      */}
      <div
        className="stagger flex items-end gap-1"
        style={{ height: "6rem", "--stagger": "35ms" } as CSSProperties}
        aria-hidden="true"
      >
        {days.map((day) => (
          <div key={day.date} className="flex h-full flex-1 items-end">
            <div
              title={`${day.label}: ${day.count} ${day.count === 1 ? "change" : "changes"}`}
              className={cn(
                "animate-grow-up animate-delay w-full origin-bottom rounded-t-[4px] transition-colors duration-150",
                day.count > 0 ? "bg-brand hover:bg-brand-hover" : "bg-rule",
              )}
              style={{ height: day.count > 0 ? `${(day.count / peak) * 100}%` : "2px" }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-baseline justify-between border-t border-rule pt-2 text-xs text-muted">
        <span>{days[0]?.label}</span>
        <span className="tabular-nums">
          {total} {total === 1 ? "change" : "changes"} · peak {peak}/day
        </span>
        <span>{days[days.length - 1]?.label}</span>
      </div>

      <table className="sr-only">
        <caption>Admin changes per day</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Changes</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{day.date}</th>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
