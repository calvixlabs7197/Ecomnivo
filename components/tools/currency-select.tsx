"use client";

import { CURRENCIES, isCurrencyCode, type CurrencyCode } from "@/config/currencies";

/**
 * Currency picker.
 *
 * This changes formatting only — EcomNivo never converts between currencies
 * (docs/ARCHITECTURE.md §0, decision 4). The label says "Display in" rather
 * than "Currency" so nobody expects an exchange rate.
 */
export function CurrencySelect({
  value,
  onChange,
  id = "currency-select",
}: {
  value: CurrencyCode;
  onChange: (next: CurrencyCode) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted">
        Display in
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          if (isCurrencyCode(event.target.value)) onChange(event.target.value);
        }}
        className="h-9 rounded-md border border-rule-strong bg-page px-2 text-sm font-medium text-ink transition-colors duration-150 ease-soft hover:border-muted"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
    </div>
  );
}
