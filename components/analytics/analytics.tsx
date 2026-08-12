"use client";

import Script from "next/script";

import { useConsent } from "@/lib/analytics/consent";

/**
 * Google Analytics 4, loaded only when it is both configured and consented to.
 *
 * The script is not merely disabled without consent — it is never requested.
 * Consent Mode's "load the tag, deny storage" pattern is legitimate, but not
 * making the request at all is simpler to reason about and simpler to verify:
 * open the network tab, and either googletagmanager.com is there or it is not.
 *
 * `afterInteractive` rather than `beforeInteractive`, because nothing on this
 * site depends on analytics being ready and the calculators should hydrate
 * first.
 */
export function Analytics({ measurementId }: { measurementId: string | null }) {
  const { consent } = useConsent();

  if (!measurementId) return null;
  if (consent !== "granted") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
