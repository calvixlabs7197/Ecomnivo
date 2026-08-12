import Link from "next/link";
import type { Route } from "next";
import type { Crumb } from "@/lib/seo/jsonld";

/**
 * Visible breadcrumb trail.
 *
 * The same `Crumb[]` is passed to `breadcrumbSchema()` on every page that uses
 * this, which is what keeps the structured data and the visible trail in sync.
 * Marking up breadcrumbs the user cannot see is a structured-data violation.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.name} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href as Route}
                  className="transition-colors duration-150 ease-soft hover:text-ink"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {crumb.name}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-rule-strong">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
