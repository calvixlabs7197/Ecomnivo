import Link from "next/link";
import { hasAffiliateProgrammes } from "@/config/monetization";
import { cn } from "@/lib/utils";

/**
 * Page-level affiliate disclosure.
 *
 * Placed above any content containing affiliate links, because
 * /affiliate-disclosure promises disclosure *on the page* rather than only in
 * a policy someone would have to go looking for.
 *
 * Renders nothing while there are no active programmes, so it can never become
 * a stale claim that a page earns commission when it does not. A Server
 * Component — this is static text and has no business in the client bundle.
 */
export function AffiliateNotice({ className }: { className?: string }) {
  if (!hasAffiliateProgrammes) return null;

  return (
    <p
      className={cn(
        "rounded-md border border-rule bg-surface px-4 py-3 text-sm leading-relaxed text-muted",
        className,
      )}
    >
      Some links on this page are affiliate links, marked as such. If you buy through
      one we may earn a commission at no extra cost to you, and it never affects what a
      calculator returns or what we recommend.{" "}
      <Link
        href="/affiliate-disclosure"
        className="font-medium text-brand underline underline-offset-2 hover:text-brand-hover"
      >
        Full disclosure
      </Link>
      .
    </p>
  );
}
