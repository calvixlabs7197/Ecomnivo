import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The admin's own small design system.
 *
 * Every screen is built from these five pieces — header, stat, panel, table,
 * empty state — so twelve screens look like one product rather than twelve
 * people's ideas of a table. They are plain server components: the admin ships
 * almost no JavaScript, and the parts that need it (the sidebar, the filter
 * bar, the save forms) are the exceptions rather than the rule.
 */

export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** A "back to the list" link, for detail screens. */
  back?: { href: Route; label: string };
  /** Small facts under the title — a URL, a status, a timestamp. */
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-rule pb-6">
      {back ? (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors duration-150 ease-soft hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h2">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-reading leading-relaxed text-muted">{description}</p>
          ) : null}
          {meta ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
              {meta}
            </div>
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

/**
 * A single number, and what it means.
 *
 * The label is above the value rather than below it, because these are read in
 * a row: the eye scans the labels to find the one it wants, then drops to the
 * figure. `tabular-nums` keeps a row of them from jittering as counts change.
 */
export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: Route;
  tone?: "neutral" | "positive" | "caution" | "critical";
}) {
  const toneClass = {
    neutral: "text-ink",
    positive: "text-positive",
    caution: "text-caution",
    critical: "text-critical",
  }[tone];

  const body = (
    <div className="lift flex h-full flex-col rounded-lg border border-rule bg-page p-4 group-hover:border-rule-strong">
      <p className="flex items-center gap-1 text-sm text-muted">
        {label}
        {href ? (
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 opacity-0 transition-opacity duration-150 ease-soft group-hover:opacity-100"
          />
        ) : null}
      </p>
      {/* Keyed by the value so a changed figure replays the pop — the same
          motion the calculator's results use, for the same reason. */}
      <p key={String(value)} className={cn("animate-pop mt-1 text-3xl font-bold tabular-nums", toneClass)}>
        {value}
      </p>
      {hint ? <p className="mt-auto pt-2 text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );

  if (!href) return <div className="group h-full">{body}</div>;

  return (
    <Link href={href} className="group block h-full rounded-lg">
      {body}
    </Link>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>li]:animate-fade-up [&>li]:animate-delay">
      {children}
    </ul>
  );
}

/** A titled block. The workhorse container for everything below the header. */
export function Panel({
  title,
  description,
  actions,
  children,
  footer,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("animate-fade-up rounded-lg border border-rule bg-page", className)}>
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-4">
          <div className="min-w-0">
            {title ? <h2 className="text-h3">{title}</h2> : null}
            {description ? (
              <p className="mt-1 max-w-reading text-sm leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      {children}

      {footer ? (
        <div className="border-t border-rule px-5 py-3 text-sm text-muted">{footer}</div>
      ) : null}
    </section>
  );
}

/** Body padding for a Panel holding prose or fields rather than a table. */
export function PanelBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

// --- tables -------------------------------------------------------------------

export function DataTable({
  head,
  children,
  minWidth = "40rem",
}: {
  head: ReactNode;
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-rule bg-surface/60">{head}</tr>
        </thead>
        <tbody className="divide-y divide-rule [&>tr]:transition-colors [&>tr]:duration-150 [&>tr:hover]:bg-surface/70">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted",
        align === "right" && "text-right",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <td className={cn("px-4 py-3 align-top", align === "right" && "text-right", className)}>
      {children}
    </td>
  );
}

/** The first cell of a content row: a name, and the URL it lives at. */
export function RowTitle({
  title,
  path,
  href,
}: {
  title: string;
  path?: string;
  href?: Route;
}) {
  return (
    <>
      {href ? (
        <Link href={href} className="font-medium text-ink hover:text-brand">
          {title}
        </Link>
      ) : (
        <span className="font-medium text-ink">{title}</span>
      )}
      {path ? <span className="mt-0.5 block font-mono text-xs text-muted">{path}</span> : null}
    </>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="max-w-reading text-sm leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Label/value pairs, for the status screens. */
export function KeyValue({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="divide-y divide-rule">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3"
        >
          <dt className="text-sm text-muted">{row.label}</dt>
          <dd className="text-sm text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A note the reader is meant to act on, or stop worrying about.
 *
 * Deliberately not a toast: everything the admin needs to say is true for as
 * long as the page is open, and a message that disappears is a message that
 * gets missed.
 */
export function Callout({
  tone = "neutral",
  title,
  children,
}: {
  tone?: "neutral" | "caution" | "critical" | "positive";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    neutral: "border-rule bg-surface text-muted",
    caution: "border-caution/30 bg-caution/5 text-ink",
    critical: "border-critical/30 bg-critical/5 text-ink",
    positive: "border-positive/30 bg-positive/5 text-ink",
  } as const;

  return (
    <div className={cn("rounded-lg border p-4 text-sm leading-relaxed", tones[tone])}>
      {title ? <p className="font-medium text-ink">{title}</p> : null}
      <div className={cn(title && "mt-1")}>{children}</div>
    </div>
  );
}
