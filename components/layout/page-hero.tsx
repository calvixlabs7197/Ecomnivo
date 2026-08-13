import type { CSSProperties, ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { Crumb } from "@/lib/seo/jsonld";

/**
 * The top of a listing page: crumbs, an h1, and a line of lead text.
 *
 * Four pages were carrying the same twelve lines of JSX, which is how the
 * homepage ended up with a treated header and every other page ended up flat.
 * One component means a change to the entrance or the wash lands everywhere,
 * and the copy stays with the page that owns it.
 */
export function PageHero({
  crumbs,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  lead?: ReactNode;
  /** Anything below the lead — a second paragraph, a control, a note. */
  children?: ReactNode;
}) {
  return (
    <div className="aurora relative border-b border-rule">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs crumbs={crumbs} />

        <div
          className="stagger mt-6 max-w-reading"
          style={{ "--stagger": "80ms" } as CSSProperties}
        >
          <h1 className="animate-fade-up animate-delay text-h1">{title}</h1>
          {lead ? (
            <p className="animate-fade-up animate-delay mt-4 text-lead leading-relaxed text-muted">
              {lead}
            </p>
          ) : null}
          {children ? (
            <div className="animate-fade-up animate-delay mt-4">{children}</div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
