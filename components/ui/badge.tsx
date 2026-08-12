import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "quiet" | "positive" | "caution" | "critical";

const tones: Record<Tone, string> = {
  neutral: "border-rule bg-surface text-muted",
  brand: "border-brand/20 bg-brand-tint text-brand-hover",
  quiet: "border-transparent bg-transparent text-muted",
  /**
   * State tones, added for the admin.
   *
   * They exist so a screen can say "published", "needs attention" and "broken"
   * without inventing a colour per screen, and they are never decoration: the
   * label always carries the meaning on its own, so the colour is redundant
   * rather than load-bearing.
   */
  positive: "border-positive/25 bg-positive/5 text-positive",
  caution: "border-caution/25 bg-caution/5 text-caution",
  critical: "border-critical/25 bg-critical/5 text-critical",
};

/**
 * Category and status labels.
 *
 * Categories deliberately share one neutral tone rather than each getting a
 * colour. Four colours across every card in a grid is how a restrained palette
 * turns into a rainbow.
 */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
