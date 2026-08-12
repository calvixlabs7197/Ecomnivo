"use client";

import type { ReactNode } from "react";
import { buildAffiliateUrl, getAffiliateProgramme } from "@/config/monetization";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

/**
 * An affiliate link, or plain text.
 *
 * Every rule published on /affiliate-disclosure is enforced here rather than
 * left to whoever adds the first link:
 *
 * - `rel="sponsored nofollow noopener noreferrer"` — `sponsored` is the
 *   attribute Google asks for on paid links, and omitting it is the single
 *   most common way sites get this wrong.
 * - A **visible** marker, because the disclosure page promises disclosure on
 *   the page rather than buried in a policy.
 * - An outbound click event, so the value of a placement is measurable.
 *
 * An unknown or inactive programme renders the children as plain text. A
 * commercial arrangement ending should never leave a dead link behind.
 */
export function AffiliateLink({
  programme: programmeId,
  children,
  className,
}: {
  programme: string;
  children: ReactNode;
  className?: string;
}) {
  const programme = getAffiliateProgramme(programmeId);

  if (!programme) return <>{children}</>;

  return (
    <a
      href={buildAffiliateUrl(programme)}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={() =>
        track("affiliate_click", {
          merchant: programme.merchant,
          network: programme.network,
        })
      }
      className={cn(
        "font-medium text-brand underline decoration-brand/30 underline-offset-2 transition-colors duration-150 ease-soft hover:text-brand-hover hover:decoration-brand",
        className,
      )}
    >
      {children}
      <span className="ml-1 text-xs font-normal text-muted">(affiliate)</span>
    </a>
  );
}

