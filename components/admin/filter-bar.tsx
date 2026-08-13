"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Search, X } from "lucide-react";

export interface FilterSelect {
  name: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

/**
 * Search and filter controls for a list screen.
 *
 * State lives in the URL, not in React. That is the whole reason this exists:
 * `/admin/guides?status=draft` is a link someone can bookmark, share in a
 * message, or come back to after editing a guide — and because the filtering
 * itself happens on the server, the page never ships a copy of every row to
 * the browser just so it can hide most of them.
 *
 * Typing is debounced so a five-letter query is one navigation rather than
 * five, and the value is never made a controlled prop of the server's state —
 * otherwise the input would fight the round trip it just triggered.
 */
export function FilterBar({
  searchPlaceholder = "Search…",
  selects = [],
  resultLabel,
}: {
  searchPlaceholder?: string;
  selects?: readonly FilterSelect[];
  /** e.g. "12 of 22 calculators" — rendered on the right. */
  resultLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the box in step when the URL changes from outside — Clear, the back
  // button, or a link into the screen with a query already applied. Adjusted
  // during render rather than in an effect: an effect would paint the stale
  // value first and then immediately re-render over it.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  useEffect(() => () => (debounce.current ? clearTimeout(debounce.current) : undefined), []);

  function apply(next: URLSearchParams) {
    const search = next.toString();
    router.replace((search ? `${pathname}?${search}` : pathname) as Route, { scroll: false });
  }

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    apply(next);
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setParam("q", value.trim()), 250);
  }

  const isFiltered =
    Boolean(urlQuery) || selects.some((select) => Boolean(searchParams.get(select.name)));

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-rule px-4 py-3 sm:px-5">
      {/* Full width on its own row below `sm`: sharing a row with two selects
          squeezed the search box to about seventy pixels on a phone. */}
      <div className="relative w-full sm:w-auto sm:min-w-0 sm:max-w-xs sm:flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <label htmlFor="admin-filter-q" className="sr-only">
          Search
        </label>
        <input
          id="admin-filter-q"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-md border border-rule-strong bg-page pl-9 pr-3 text-sm text-ink transition-colors duration-150 ease-soft hover:border-muted"
        />
      </div>

      {selects.map((select) => (
        <div key={select.name} className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
          <label htmlFor={`admin-filter-${select.name}`} className="sr-only">
            {select.label}
          </label>
          <select
            id={`admin-filter-${select.name}`}
            value={searchParams.get(select.name) ?? ""}
            onChange={(event) => setParam(select.name, event.target.value)}
            className="h-9 w-full min-w-0 rounded-md border border-rule-strong bg-page px-2 text-sm text-ink transition-colors duration-150 ease-soft hover:border-muted sm:w-auto"
          >
            <option value="">{select.label}: all</option>
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {isFiltered ? (
        <button
          type="button"
          onClick={() => apply(new URLSearchParams())}
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-muted transition-colors duration-150 ease-soft hover:bg-surface hover:text-ink"
        >
          <X aria-hidden="true" className="size-4" />
          Clear
        </button>
      ) : null}

      {resultLabel ? (
        <p className="ml-auto text-sm tabular-nums text-muted">{resultLabel}</p>
      ) : null}
    </div>
  );
}
