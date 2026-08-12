"use client";

import { currencySymbol, type CurrencyCode } from "@/config/currencies";
import type { ToolField } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

/**
 * One labelled numeric input.
 *
 * `type="text"` with `inputMode="decimal"` rather than `type="number"`, on
 * purpose: number inputs silently change value when the wheel scrolls over
 * them, accept "e" as scientific notation, and hide typos behind a spinner.
 * The mobile keypad is what `inputMode` is for, and we get it either way.
 *
 * `text-base` (16px) is deliberate too — anything smaller makes iOS Safari
 * zoom the page in when the field is focused.
 */
export function ToolFieldInput({
  field,
  value,
  error,
  currency,
  onChange,
}: {
  field: ToolField;
  value: string;
  error?: string;
  currency: CurrencyCode;
  onChange: (next: string) => void;
}) {
  const inputId = `field-${field.name}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  const prefix = field.kind === "currency" ? currencySymbol(currency) : null;
  const suffix = field.kind === "percent" ? "%" : null;

  const describedBy = error ? errorId : field.help ? helpId : undefined;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {field.label}
        {field.optional ? <span className="ml-1.5 font-normal text-muted">(optional)</span> : null}
      </label>

      <div className="relative mt-1.5">
        {prefix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted"
          >
            {prefix}
          </span>
        ) : null}

        <input
          id={inputId}
          name={field.name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full rounded-md border bg-page px-3 text-base tabular-nums text-ink transition-colors duration-150 ease-soft placeholder:text-muted",
            prefix && (prefix.length > 1 ? "pl-12" : "pl-8"),
            suffix && "pr-8",
            error ? "border-critical" : "border-rule-strong hover:border-muted",
          )}
        />

        {suffix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted"
          >
            {suffix}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-critical">
          {error}
        </p>
      ) : field.help ? (
        <p id={helpId} className="mt-1.5 text-sm text-muted">
          {field.help}
        </p>
      ) : null}
    </div>
  );
}
