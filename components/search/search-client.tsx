"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search as SearchIcon } from "lucide-react";

import { searchDocs, type SearchDoc, type SearchKind } from "@/lib/search";
import { track } from "@/lib/analytics/events";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";

const kindLabel: Record<SearchKind, string> = {
  tool: "Tool",
  guide: "Guide",
  category: "Category",
};

export function SearchClient({
  initialQuery,
  index,
}: {
  initialQuery: string;
  /** Built on the server so results reflect whatever the admin has published. */
  index: SearchDoc[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchDocs(index, query), [index, query]);
  const trimmed = query.trim();

  /**
   * One event per settled search rather than one per keystroke.
   *
   * `result_count` is the reason this is worth collecting at all: a term that
   * repeatedly returns nothing is the clearest signal of a missing tool or
   * guide.
   */
  useEffect(() => {
    if (trimmed.length < 2) return;
    const timer = setTimeout(
      () => track("search", { search_term: trimmed, result_count: results.length }),
      800,
    );
    return () => clearTimeout(timer);
  }, [trimmed, results.length]);

  function handleChange(next: string) {
    setQuery(next);

    // Keep the URL shareable without pushing a history entry per keystroke.
    const url = new URL(window.location.href);
    if (next.trim()) url.searchParams.set("q", next.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="max-w-reading">
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Search tools and guides"
          aria-label="Search tools and guides"
          // Autofocus is right here and wrong almost everywhere else: this is a
          // dedicated search page, and the input is the only reason to be on it.
          autoFocus
          className="h-12 w-full rounded-md border border-rule-strong bg-page pl-11 pr-4 text-base text-ink transition-colors duration-150 ease-soft placeholder:text-muted hover:border-muted"
        />
      </div>

      <div aria-live="polite" className="mt-6">
        {trimmed === "" ? (
          <p className="text-muted">
            Start typing to search {" "}
            <Link href={"/tools" as Route} className="text-brand hover:text-brand-hover">
              22 calculators
            </Link>{" "}
            and every guide.
          </p>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-rule-strong bg-surface p-8 text-center">
            <p className="font-medium text-ink">
              Nothing matched &ldquo;{trimmed}&rdquo;
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Try a metric name such as &ldquo;margin&rdquo;, &ldquo;ROAS&rdquo; or
              &ldquo;conversion&rdquo;, or browse everything instead.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href={"/tools" as Route} className={buttonStyles({ size: "sm" })}>
                All tools
              </Link>
              <Link
                href={"/guides" as Route}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                All guides
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {results.map((doc) => (
                <li key={doc.href}>
                  <Link href={doc.href as Route} className="group block rounded-lg">
                    <Card interactive>
                      <div className="flex items-start justify-between gap-4 p-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-ink">{doc.title}</h2>
                            <Badge>{kindLabel[doc.kind]}</Badge>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            {doc.description}
                          </p>
                        </div>
                        <ArrowRight
                          aria-hidden="true"
                          className="mt-1 size-4 shrink-0 text-muted transition-transform duration-150 ease-soft group-hover:translate-x-0.5 group-hover:text-brand"
                        />
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
