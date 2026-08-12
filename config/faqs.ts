import type { FaqItem } from "@/components/ui/accordion";

/**
 * Site-wide FAQ.
 *
 * One array feeds the visible accordions and the FAQPage structured data on
 * both the homepage and /faq, so the markup can never describe questions the
 * page does not show.
 *
 * Answers are written to be true today, not aspirational. Phase 5 moves these
 * into the `faq_items` table (scope `site`) so they become editable without a
 * deploy.
 */
export const siteFaqs: ReadonlyArray<FaqItem> = [
  {
    q: "Are the calculators free?",
    a: "Yes. Every calculator on EcomNivo is free to use, with no account, no trial period and no cap on how many times you can run one. If we ever add paid features, the existing free tools stay free.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Nothing on the site requires signing in. Your inputs are calculated in your browser and are not sent to us or stored anywhere.",
  },
  {
    q: "Which currencies are supported?",
    a: "You can display results in USD, GBP, EUR, CAD or AUD, with USD as the default. The calculators format your currency but never convert between currencies — every formula works on figures in a single currency, so a conversion rate would add a source of error without adding any accuracy.",
  },
  {
    q: "How accurate are the results?",
    a: "Every formula is derived by hand, documented on its tool page, and covered by unit tests before the tool goes live — including the zero, empty and negative inputs that commonly make calculators return NaN or Infinity. You can check our working: each page shows the formula and a worked example.",
  },
  {
    q: "Can I use these with Shopify, Amazon, WooCommerce or Etsy?",
    a: "Yes. The maths behind profit, margin, ROAS and pricing is the same regardless of platform. Where a platform's fee structure genuinely changes the calculation — as Shopify Payments does — we build a dedicated tool for it rather than pretending one generic calculator covers everything.",
  },
  {
    q: "How is EcomNivo funded?",
    a: "The site will be supported by advertising and affiliate partnerships. Neither is live yet. When they are, ad placements will stay out of the way of the calculators, and any affiliate link will be disclosed and marked as sponsored.",
  },
  {
    q: "What is a good ROAS, margin or conversion rate?",
    a: "There is no single answer, and any site that gives you one is guessing. A good ROAS is set by your gross margin — at a 40% margin you need 2.50x just to break even. A good conversion rate depends on your category and price point. Each tool page explains what actually determines the figure for you rather than quoting an average.",
  },
  {
    q: "Do the calculators convert between currencies?",
    a: "No, deliberately. Every formula here operates on amounts in a single currency, so an exchange rate would introduce staleness and a source of error without making any answer more accurate. Changing the currency changes the formatting only.",
  },
  {
    q: "Is my data stored or shared?",
    a: "No. Calculations run entirely in your browser and your inputs are never transmitted to us. The only thing kept on your device is your preferred display currency, in local storage. See the privacy policy for the full picture.",
  },
  {
    q: "Can I use these tools for client work?",
    a: "Yes. Use them for your own business or your clients', commercially or otherwise. You do not need permission and there is nothing to attribute, though a link back is always welcome.",
  },
  {
    q: "Is this financial advice?",
    a: "No. These are arithmetic tools. They can tell you what your margin is; they cannot tell you what to do about it. Nothing on the site is financial, accounting, tax or legal advice — see the disclaimer.",
  },
  {
    q: "How often are the tools updated?",
    a: "Formulas do not change, because arithmetic does not. What does change is platform fee structures — Shopify's rates, for example — which is why those are editable fields with commonly published defaults rather than hardcoded values. Always check your own billing.",
  },
];

/**
 * The homepage shows a subset. Six is what fits without the section dominating
 * the page; the full set lives on /faq.
 */
export const homeFaqs: ReadonlyArray<FaqItem> = siteFaqs.slice(0, 6);
