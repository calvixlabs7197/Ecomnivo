import { env } from "@/config/env";

/**
 * Single source of truth for brand-level strings and navigation.
 *
 * Phase 4 moves the editable subset of this into the `site_settings` table so
 * an admin can change it without a deploy; the shape stays the same, so the
 * consumers below do not change.
 */
export const siteConfig = {
  name: "EcomNivo",
  tagline: "Smart Tools for Smarter E-commerce",
  description:
    "Free calculators and tools to help you understand profitability, advertising performance, pricing, fees, and growth.",
  url: env.SITE_URL,
  locale: "en_US",
  /**
   * Deliberately empty. Social profiles get added here (and to the
   * Organization `sameAs`) when the accounts actually exist — inventing URLs
   * would put dead links in structured data.
   */
  socials: [] as ReadonlyArray<{ label: string; href: string }>,

  /**
   * LAUNCH BLOCKER while this is null.
   *
   * A privacy policy has to name a way to reach the data controller, and
   * inventing an address is not an option. The legal pages render an explicit
   * notice instead of a contact route while this is unset, so the gap is
   * visible rather than silent. Set it before the site goes public.
   */
  contactEmail: null as string | null,
} as const;

/**
 * Header navigation. Kept to four items on purpose: the brief's rule is that
 * the header must not get crowded, and every link here has to earn its slot.
 *
 * Search lands in Phase 4 alongside the /search route and the guide index —
 * shipping a search control that opens nothing would be worse than not having
 * one yet.
 */
export const mainNav = [
  { label: "Tools", href: "/tools" },
  { label: "Categories", href: "/categories" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
] as const;

/**
 * Footer columns.
 *
 * The legal column arrived in Phase 4, when those pages got real reviewed
 * content. They were deliberately absent rather than stubbed before that:
 * placeholder legal text is indexable, meaningless and misleading.
 */
export const footerNav = [
  {
    heading: "Tools",
    links: [
      { label: "All tools", href: "/tools" },
      { label: "Profitability", href: "/categories/profitability" },
      { label: "Advertising", href: "/categories/advertising" },
      { label: "Pricing", href: "/categories/pricing" },
      { label: "Growth", href: "/categories/growth" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Browse categories", href: "/categories" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Editorial policy", href: "/editorial-policy" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
    ],
  },
] as const;
