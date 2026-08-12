"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";

import { getToolEngine } from "@/lib/tools/engines";
import { evaluateForm } from "@/lib/tools/validate";
import { formatResult } from "@/lib/tools/format";
import type { ToolEngine, ToolInput } from "@/lib/tools/types";
import { useCurrency } from "@/hooks/use-currency";
import { track } from "@/lib/analytics/events";

import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/tools/currency-select";
import { ToolFieldInput } from "@/components/tools/tool-field-input";
import { ToolResults } from "@/components/tools/tool-results";

/**
 * The only interactive part of a tool page.
 *
 * It takes a slug rather than the engine itself because `compute` is a
 * function and functions cannot cross the server/client boundary as props.
 * Everything else on the page — intro, formula, worked example, FAQs — stays
 * server-rendered and costs the browser nothing.
 */
export function ToolRunner({
  slug,
  toolName,
  category,
}: {
  slug: string;
  toolName: string;
  category: string;
}) {
  const engine = getToolEngine(slug);
  if (!engine) return null;
  return <Runner engine={engine} toolName={toolName} category={category} />;
}

function initialValues(engine: ToolEngine<ToolInput>): Record<string, string> {
  return Object.fromEntries(
    engine.fields.map((field) => [
      field.name,
      field.defaultValue === undefined ? "" : String(field.defaultValue),
    ]),
  );
}

function Runner({
  engine,
  toolName,
  category,
}: {
  engine: ToolEngine<ToolInput>;
  toolName: string;
  category: string;
}) {
  const { currency, setCurrency } = useCurrency();
  const defaults = useMemo(() => initialValues(engine), [engine]);
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  /**
   * Whether the visitor has edited anything.
   *
   * Every tool ships with working defaults, so a freshly loaded page is already
   * a complete calculation. Reporting that as a use would make the metric
   * indistinguishable from a page view — `tool_calculate` should mean somebody
   * ran their own numbers.
   */
  const [touched, setTouched] = useState(false);

  const { input, errors } = evaluateForm(engine.fields, values);
  const ready = input !== null;

  /**
   * When the form is incomplete we still call compute — with zeros — purely to
   * get the shape of the results (their labels and order) so the panel can
   * render placeholders at the correct size. `compute` is total, so this is
   * always safe, and `ready` stops any of those zero-derived values being shown.
   */
  const shape = useMemo(
    () => Object.fromEntries(engine.fields.map((field) => [field.name, 0])),
    [engine],
  );
  const results = engine.compute(input ?? shape);

  const summary = ready
    ? results
        .filter((result) => result.emphasis === "primary")
        .map((result) => `${result.label}: ${formatResult(result.value, result.format, currency)}`)
        .join(", ")
    : "";

  // Announce results to screen readers once typing settles, rather than on
  // every keystroke — a live region that fires per character is unusable.
  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(summary), 700);
    return () => clearTimeout(timer);
  }, [summary]);

  /**
   * Record a completed calculation on the same settle delay as the
   * announcement, so a single edit is one event rather than one per keystroke.
   * The event carries the tool and category only — never the figures typed.
   */
  useEffect(() => {
    if (!ready || !touched) return;
    const timer = setTimeout(
      () => track("tool_calculate", { tool_slug: engine.slug, category }),
      700,
    );
    return () => clearTimeout(timer);
  }, [ready, touched, summary, engine.slug, category]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  function handleCopy() {
    const lines = [
      `${toolName} — EcomNivo`,
      "",
      ...engine.fields.map((field) => `${field.label}: ${values[field.name] || "—"}`),
      "",
      ...results.map(
        (result) =>
          `${result.label}: ${ready ? formatResult(result.value, result.format, currency) : "—"}`,
      ),
      "",
      window.location.href,
    ];

    void navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => {
        setCopied(true);
        track("tool_copy_results", { tool_slug: engine.slug });
      })
      .catch(() => {
        // Clipboard can be blocked by permissions policy; failing quietly is
        // better than an alert the visitor cannot act on.
      });
  }

  return (
    <section aria-labelledby="calculator-heading" className="rounded-lg border border-rule p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
        <h2 id="calculator-heading" className="text-h3">
          Calculator
        </h2>
        <CurrencySelect
          value={currency}
          onChange={(next) => {
            setCurrency(next);
            track("currency_change", { currency: next });
          }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2">
            {engine.fields.map((field) => (
              <ToolFieldInput
                key={field.name}
                field={field}
                value={values[field.name] ?? ""}
                error={errors[field.name]}
                currency={currency}
                onChange={(next) => {
                  setTouched(true);
                  setValues((current) => ({ ...current, [field.name]: next }));
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setValues(defaults);
                setTouched(false);
                track("tool_reset", { tool_slug: engine.slug });
              }}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Reset
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!ready}>
              {copied ? (
                <Check aria-hidden="true" className="size-4 text-positive" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
              {copied ? "Copied" : "Copy results"}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <ToolResults results={results} currency={currency} ready={ready} />
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
