import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Vertical rhythm for homepage and listing sections. One place to change the
 * section spacing for the whole site.
 */
export function Section({
  children,
  className,
  id,
  tone = "page",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "page" | "surface";
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        tone === "surface" && "border-y border-rule bg-surface",
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * Section heading with an optional trailing action.
 *
 * The eyebrow is a label, not decoration: it names the section for screen
 * readers via the heading it sits above, and gives the eye an entry point.
 */
export function SectionHeading({
  id,
  title,
  description,
  action,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="reveal mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-reading">
        <h2 id={id} className="text-h2">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
