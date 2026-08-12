"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useConsent } from "@/lib/analytics/consent";
import { cn } from "@/lib/utils";

/**
 * A real ad unit.
 *
 * Written against Google AdSense, which is what `NEXT_PUBLIC_AD_CLIENT_ID`
 * (`ca-pub-…`) implies. Swapping provider means changing this one file — that
 * is the reason `AdSlot` delegates here rather than inlining the markup.
 *
 * **Ads do not load without analytics consent.** Personalised advertising
 * requires consent in the UK and EU, and rather than guess at a
 * non-personalised fallback configuration we would not be able to verify, no
 * consent means no ad request. That is a revenue trade-off made knowingly, and
 * it is the item to revisit with the ad provider's consent-mode documentation
 * before launch — not something to discover afterwards.
 */
export function AdUnit({
  placement,
  clientId,
  reservedHeight,
}: {
  placement: string;
  clientId: string;
  reservedHeight: string;
}) {
  const { consent } = useConsent();
  const pushed = useRef(false);
  const canRender = consent === "granted" && Boolean(clientId);

  useEffect(() => {
    if (!canRender || pushed.current) return;

    try {
      const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
      if (Array.isArray(adsbygoogle)) {
        adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // A blocked or failed ad request must never break the page around it.
    }
  }, [canRender]);

  if (!canRender) return null;

  return (
    <>
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      />
      <ins
        className={cn("adsbygoogle block w-full", reservedHeight)}
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={placement}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}
