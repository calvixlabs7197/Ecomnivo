import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "quiet";

const tones: Record<Tone, string> = {
  neutral: "border-rule bg-surface text-muted",
  brand: "border-brand/20 bg-brand-tint text-brand-hover",
  quiet: "border-transparent bg-transparent text-muted",
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
