"use client";

import type { CurrencyCode } from "@/config/currencies";
import { formatResult } from "@/lib/tools/format";
import type { ToolResult } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

const toneClass = {
  neutral: "text-ink",
  positive: "text-positive",
  negative: "text-critical",
} as const;

/**
 * The results panel.
 *
 * Always rendered, even before there is anything to show — the placeholder
 * state occupies the same space as the answered state, so nothing on the page
 * moves when a result appears. That is the difference between CLS 0 and a
 * layout shift on every keystroke.
 */
export function ToolResults({
  results,
  currency,
  ready,
}: {
  results: ToolResult[];
  currency: CurrencyCode;
  /** False while a required field is still empty. */
  ready: boolean;
}) {
  const primary = results.filter((result) => result.emphasis === "primary");
  const rest = results.filter((result) => result.emphasis !== "primary");

  return (
    <div className="overflow-hidden rounded-lg border border-rule bg-gradient-to-b from-brand-tint/60 to-surface p-5 sm:p-6">
      <h3 className="text-eyebrow uppercase text-muted">Results</h3>

      <div className="mt-4 flex flex-col gap-5">
        {primary.map((result) => {
          const formatted = ready
            ? formatResult(result.value, result.format, currency)
            : "—";

          return (
            <div key={result.key}>
              <p className="text-sm text-muted">{result.label}</p>
              {/*
                Keyed by the formatted value, so React remounts the node when
                the number changes and the pop animation replays. It is 350ms of
                scale from 0.97 — enough to catch the eye of someone watching
                the inputs, short enough that typing a five-digit figure does not
                feel like it is fighting back.
              */}
              <p
                key={formatted}
                className={cn(
                  "animate-pop mt-1 text-4xl font-bold tabular-nums tracking-tight",
                  // The placeholder is meaningful text ("no value yet"), so it
                  // takes a readable colour rather than a decorative grey.
                  ready ? toneClass[result.tone ?? "neutral"] : "text-muted",
                )}
              >
                {formatted}
              </p>
              {ready && result.note ? (
                <p className="mt-1.5 max-w-prose text-sm text-muted">{result.note}</p>
              ) : null}
            </div>
          );
        })}

        {rest.length > 0 ? (
          <dl className="flex flex-col divide-y divide-rule border-t border-rule">
            {rest.map((result) => (
              // <dt> and <dd> must be direct children of this wrapper div, and
              // the wrapper a direct child of the <dl>. Nesting them any deeper
              // makes the definition list invalid and breaks the accessibility
              // tree. A second <dd> for the note is valid — one term may have
              // several descriptions.
              <div
                key={result.key}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
              >
                <dt className="text-sm text-muted">{result.label}</dt>
                <dd
                  className={cn(
                    "text-lg font-semibold tabular-nums",
                    ready ? toneClass[result.tone ?? "neutral"] : "text-muted",
                  )}
                >
                  {ready ? formatResult(result.value, result.format, currency) : "—"}
                </dd>
                {ready && result.note ? (
                  <dd className="w-full max-w-prose text-sm text-muted">{result.note}</dd>
                ) : null}
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      {!ready ? (
        <p className="mt-5 text-sm text-muted">
          Fill in every field above to see your results.
        </p>
      ) : null}
    </div>
  );
}
