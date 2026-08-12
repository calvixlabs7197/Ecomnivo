"use client";

import Link from "next/link";
import { useConsent } from "@/lib/analytics/consent";
import { Button } from "@/components/ui/button";

/**
 * Analytics consent prompt.
 *
 * Three deliberate choices:
 *
 * 1. **It only exists when analytics is configured.** With no measurement ID
 *    there is nothing to consent to, so asking would be theatre.
 * 2. **Decline is a real button, styled the same as accept.** A greyed-out or
 *    hidden refusal is not freely given consent, and regulators have said so.
 * 3. **It does not block the page.** No overlay, no scrim, no trapping focus.
 *    The calculators remain usable whether or not you engage with it, which is
 *    also what §20's "ads must not interfere" implies about consent UI.
 */
export function ConsentBanner({ enabled }: { enabled: boolean }) {
  const { consent, grant, deny } = useConsent();

  if (!enabled) return null;
  if (consent !== "unset") return null;

  return (
    <div
      role="region"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-page shadow-md"
    >
      <div className="mx-auto flex max-w-page flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          We would like to use analytics to understand which tools people find useful.
          Nothing you type into a calculator is ever collected. You can decline and the
          site works exactly the same &mdash; see our{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            privacy policy
          </Link>
          .
        </p>

        <div className="flex shrink-0 gap-3">
          <Button variant="secondary" size="sm" onClick={deny}>
            Decline
          </Button>
          <Button size="sm" onClick={grant}>
            Allow analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
