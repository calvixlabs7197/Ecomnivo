/**
 * Supported display currencies.
 *
 * These change how a figure is *formatted*, never what it is worth. EcomNivo
 * does not convert between currencies: every formula here operates on amounts
 * in a single currency, so an exchange rate would introduce staleness and a
 * source of error without making any answer more accurate.
 * (docs/ARCHITECTURE.md §0, decision 4.)
 */
export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/** Key used to remember the visitor's choice. No personal data, no cookie. */
export const CURRENCY_STORAGE_KEY = "ecomnivo:currency";

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((currency) => currency.code === value);
}

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((currency) => currency.code === code)?.symbol ?? "$";
}
