import type { CurrencyCode } from "@/config/currencies";
import type { ResultFormat } from "@/lib/tools/types";

/**
 * Formatting is pinned to en-US regardless of the visitor's locale.
 *
 * Two reasons. The site is English-first, so "1,234.56" is the expected
 * grouping; and the calculator renders on the server before it hydrates, so a
 * locale-dependent format would produce a hydration mismatch on the first
 * paint for anyone outside the US.
 */
const LOCALE = "en-US";

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: CurrencyCode, decimals: number): Intl.NumberFormat {
  const key = `${currency}:${decimals}`;
  let formatter = currencyFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    currencyFormatters.set(key, formatter);
  }

  return formatter;
}

const plainFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Small money needs more precision than large money: a $0.40 cost per click
 * rounded to whole cents is fine, but a CPC of $0.0375 shown as "$0.04" hides
 * a 7% difference in what you are paying.
 */
function currencyDecimals(value: number): number {
  const magnitude = Math.abs(value);
  if (magnitude !== 0 && magnitude < 0.1) return 4;
  return 2;
}

export function formatCurrency(value: number, currency: CurrencyCode): string {
  return currencyFormatter(currency, currencyDecimals(value)).format(value);
}

export function formatPercent(value: number): string {
  // Percentages arrive as the percentage number itself: 24 means 24%.
  const decimals = Math.abs(value) !== 0 && Math.abs(value) < 1 ? 2 : 1;
  return `${value.toFixed(decimals)}%`;
}

export function formatRatio(value: number): string {
  return `${value.toFixed(2)}×`;
}

export function formatNumber(value: number): string {
  return plainFormatter.format(value);
}

/**
 * The single entry point used by the results panel.
 *
 * `null` renders as an em dash — the honest representation of "undefined for
 * these inputs", and the reason no calculator here can print NaN.
 */
export function formatResult(
  value: number | null,
  format: ResultFormat,
  currency: CurrencyCode,
): string {
  if (value === null || !Number.isFinite(value)) return "—";

  switch (format) {
    case "currency":
      return formatCurrency(value, currency);
    case "percent":
      return formatPercent(value);
    case "ratio":
      return formatRatio(value);
    case "number":
      return formatNumber(value);
  }
}

/**
 * Parses what someone actually typed.
 *
 * Accepts thousands separators and a leading currency symbol, because people
 * paste figures out of spreadsheets and dashboards. Returns `null` for empty
 * input — deliberately distinct from 0, so a blank field waits rather than
 * asserting that revenue is zero.
 */
export function parseNumericInput(raw: string): number | null {
  const cleaned = raw.replace(/[\s,$£€]/g, "").replace(/^CA|^A(?=\$)/i, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return null;

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : Number.NaN;
}
