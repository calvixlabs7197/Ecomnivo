"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { track } from "@/lib/analytics/events";

/**
 * A `next/link` that records a call-to-action click.
 *
 * A thin client leaf so the pages using it stay Server Components — the same
 * arrangement as `NavLink`. Only worth using on genuine calls to action;
 * instrumenting every link on the site would produce noise, not insight.
 */
export function TrackedLink({
  href,
  location,
  label,
  children,
  className,
}: {
  href: ComponentProps<typeof Link>["href"];
  /** Where on the site the click happened, e.g. "hero". */
  location: string;
  /** Which action it was, e.g. "explore-tools". */
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track("cta_click", { location, label })}
    >
      {children}
    </Link>
  );
}
