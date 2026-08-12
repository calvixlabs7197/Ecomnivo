"use client";

import { readConsent } from "@/lib/analytics/consent";

/**
 * The complete list of events this site sends.
 *
 * Keeping it a closed union rather than a free-form string is the whole point:
 * a typo becomes a compile error instead of a metric that quietly never
 * arrives, and anyone can read this file to see exactly what is collected.
 *
 * What is deliberately **not** here: any calculator input. We record that a
 * calculation happened and which tool it was, never the revenue, costs or
 * margins someone typed. Those never leave the browser (§22, and the privacy
 * policy says so).
 */
export interface AnalyticsEvents {
  /** A calculator produced a complete result. Fired once per settled edit. */
  tool_calculate: { tool_slug: string; category: string };
  /** Results copied to the clipboard. */
  tool_copy_results: { tool_slug: string };
  /** The reset button was used — useful for spotting confusing defaults. */
  tool_reset: { tool_slug: string };
  /** Display currency changed. */
  currency_change: { currency: string };
  /**
   * A site search was performed. `result_count` is what makes this worth
   * collecting: repeated zero-result terms are the clearest signal of a
   * missing tool or guide.
   */
  search: { search_term: string; result_count: number };
  /** A primary call to action was followed. */
  cta_click: { location: string; label: string };
  /** An affiliate link was followed. Fired before navigation. */
  affiliate_click: { merchant: string; network: string };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

type GtagFn = (
  command: "event" | "config" | "consent" | "js",
  targetOrName: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/**
 * Sends an event, or does nothing at all.
 *
 * There are three independent reasons this is a no-op, and all of them are
 * normal rather than error conditions: analytics is not configured, the
 * visitor has not granted consent, or the tag has not loaded. Callers do not
 * check any of them — that is the point of routing everything through here.
 */
export function track<K extends AnalyticsEventName>(
  name: K,
  params: AnalyticsEvents[K],
): void {
  if (typeof window === "undefined") return;
  if (readConsent() !== "granted") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", name, params);
}
