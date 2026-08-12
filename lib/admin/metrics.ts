import "server-only";

import { resolveTools } from "@/lib/tools/resolve";
import { resolveCategories } from "@/lib/categories/resolve";
import { listGuidesForAdmin } from "@/lib/content/guides";
import { listPagesForAdmin } from "@/lib/content/pages";
import { listActivity } from "@/lib/db/repositories";
import type { ActivityRecord } from "@/lib/db/types";

/**
 * Everything the dashboard counts, gathered in one place.
 *
 * The alternative — each tile running its own query in the page component —
 * is how a dashboard ends up reading the guide store four times and disagreeing
 * with itself when one of those reads happens a second later.
 */

export interface DayCount {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Short weekday-and-day label for the axis. */
  label: string;
  count: number;
}

export interface DashboardMetrics {
  tools: {
    total: number;
    live: number;
    hidden: number;
    featured: number;
    byCategory: Array<{ slug: string; name: string; live: number; total: number }>;
  };
  guides: { total: number; published: number; draft: number; scheduled: number };
  pages: { total: number; published: number; hidden: number };
  activity: ActivityRecord[];
  activityByDay: DayCount[];
  /** When the store last changed at all, or null on a fresh install. */
  lastChangeAt: string | null;
}

/** The last `days` days, oldest first, with zeroes for days nothing happened. */
export function bucketByDay(
  timestamps: readonly string[],
  days: number,
  now: Date = new Date(),
): DayCount[] {
  const counts = new Map<string, number>();

  for (const timestamp of timestamps) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) continue;
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return Array.from({ length: days }, (_, index) => {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - (days - 1 - index));
    const key = day.toISOString().slice(0, 10);

    return { date: key, label: formatter.format(day), count: counts.get(key) ?? 0 };
  });
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [tools, categories, guides, pages, activity] = await Promise.all([
    resolveTools(),
    resolveCategories(),
    listGuidesForAdmin(),
    listPagesForAdmin(),
    listActivity(),
  ]);

  const live = tools.filter((tool) => tool.status === "live");

  return {
    tools: {
      total: tools.length,
      live: live.length,
      hidden: tools.length - live.length,
      featured: live.filter((tool) => tool.featured).length,
      byCategory: categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        live: live.filter((tool) => tool.category === category.slug).length,
        total: tools.filter((tool) => tool.category === category.slug).length,
      })),
    },
    guides: {
      total: guides.length,
      published: guides.filter((guide) => guide.isVisible).length,
      draft: guides.filter((guide) => guide.status === "draft").length,
      scheduled: guides.filter((guide) => guide.status === "scheduled").length,
    },
    pages: {
      total: pages.length,
      published: pages.filter((page) => page.isPublished).length,
      hidden: pages.filter((page) => !page.isPublished).length,
    },
    activity,
    activityByDay: bucketByDay(
      activity.map((entry) => entry.createdAt),
      14,
    ),
    lastChangeAt: activity[0]?.createdAt ?? null,
  };
}
