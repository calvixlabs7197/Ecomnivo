import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SiteChrome } from "@/components/layout/site-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { Analytics } from "@/components/analytics/analytics";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { getSettings } from "@/lib/db/repositories";
import { env } from "@/config/env";

/**
 * One family, self-hosted by next/font. No runtime request to Google, no
 * layout shift from a late-arriving face, and `swap` so text is readable
 * immediately.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  // Makes every relative URL in metadata (including the generated OG image)
  // resolve to an absolute one.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "business",
  formatDetection: { telephone: false, address: false, email: false },
  // No `alternates.canonical` here on purpose: a canonical inherited from the
  // root layout would silently point every page that forgot to set one at the
  // homepage. Each page declares its own through buildMetadata().
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  // The site ships one (light) theme. Declaring it stops browsers applying
  // their own auto-dark treatment to colours we chose deliberately.
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Admin-editable, falling back to the build-time variable.
  const settings = await getSettings();
  const measurementId =
    settings.ga4MeasurementId ?? env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? null;

  return (
    <html lang={siteConfig.language} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <a href="#main" className="skip-link rounded-md bg-brand px-4 py-2 text-white">
          Skip to content
        </a>

        {/* Absent on /admin and /login, which bring their own shell. */}
        <SiteChrome>
          <Header />
        </SiteChrome>

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteChrome>
          <Footer />
        </SiteChrome>

        {/*
          Both render nothing unless analytics is configured, and the tag is
          never requested without consent. See components/analytics/.
        */}
        <ConsentBanner enabled={Boolean(measurementId)} />
        <Analytics measurementId={measurementId} />

        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}
