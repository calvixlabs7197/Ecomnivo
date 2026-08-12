import type { PageDoc } from "@/lib/content/types";
import { siteConfig } from "@/config/site";

/**
 * Legal and trust pages.
 *
 * Written to describe what this site actually does, not from a template. Two
 * things follow from that, and both are deliberate:
 *
 * 1. Where a contact address is required, the text says plainly that one is
 *    not yet published rather than inventing one. `siteConfig.contactEmail`
 *    is the switch.
 * 2. The privacy policy describes a site with no analytics and no advertising,
 *    because that is true today. Enabling either in Phase 7 changes what is
 *    collected, and this page must be updated in the same change.
 *
 * None of this is legal advice, and it is not a substitute for review by
 * someone qualified in the jurisdictions the business operates in.
 */

const LAST_UPDATED = "2026-08-12";

/**
 * Derived rather than hardcoded, so that setting `siteConfig.contactEmail`
 * updates every legal page at once instead of leaving a stale notice behind on
 * whichever one someone forgot.
 */
const CONTACT_NOTICE = siteConfig.contactEmail
  ? `## Contact\n\nQuestions about this page can be sent to [${siteConfig.contactEmail}](mailto:${siteConfig.contactEmail}).`
  : "> **Contact details are not yet published.** This site is in development and has not launched. A contact address will be added here, and on a dedicated contact page, before it is publicly available.";

export const privacyPolicy: PageDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  updatedAt: LAST_UPDATED,
  seoTitle: "Privacy Policy",
  seoDescription:
    "What EcomNivo collects, what it does not, and how your calculator inputs are handled. Short, because the answer is mostly 'nothing'.",
  contentMd: `_Last updated: 12 August 2026_

This policy explains what EcomNivo collects and what it does with it. It is short, because the answer is mostly "nothing".

## The calculators do not send us your figures

Every calculation on this site runs **in your browser**. The revenue, costs, margins and ad spend you type are never transmitted to us, never written to a server, and never stored anywhere outside the tab you typed them into. Close the tab and they are gone.

This is not a policy choice we could quietly reverse — it is how the tools are built. There is no endpoint to send them to.

## What is stored on your device

Two things, both in your browser's local storage, and neither is a cookie:

- **Your preferred display currency**, so the site remembers it between visits.
- **Your answer to the analytics question below**, so we do not ask again.

Both are preferences rather than identifiers. They contain no personal information, they are not transmitted anywhere, and clearing your browser data removes them.

## What our hosting provider processes

The site is served by a hosting provider which, like all web hosts, processes technical information necessary to deliver pages and keep the service secure. That typically includes IP addresses, browser user-agent strings and request timestamps, held for a limited period.

We do not use that data to build a profile of you, and we do not combine it with anything else.

## Analytics

**Analytics only runs if you agree to it.**

If analytics is switched on for this site, you will be asked once, in a banner at the bottom of the page. Until you choose "Allow analytics", **no analytics script is loaded and no request is made to any analytics provider** — it is not loaded-but-disabled, it is simply not there. Declining is a plain button next to accepting, and the site behaves identically either way.

If you do agree, we use Google Analytics 4 to understand which tools people find useful. What we record is limited to a fixed list of events: which calculator produced a result, whether results were copied, which display currency was chosen, what was searched for and how many results it returned, and which primary buttons were clicked.

**Your calculator inputs are never included in any of that.** They stay in your browser, as described above. We record that a calculation happened, not what was in it.

You can change your mind by clearing this site's data in your browser, which removes the stored choice and makes the banner appear again.

## Advertising

**No advertising is currently served on this site.**

If it is added, it will require the same consent as analytics — no ad script is requested unless you have agreed. This page will be updated in the same release that enables it, not afterwards.

## Your rights

Depending on where you live, you may have rights over personal data relating to you — including the right to access it, correct it, have it erased, restrict or object to its processing, and to lodge a complaint with a supervisory authority.

Because we do not currently collect personal data through this site, in most cases there is nothing for us to hold, correct or erase. Where our hosting provider processes technical data on our behalf, requests can be directed to us.

${CONTACT_NOTICE}

## Children

This site is intended for people running or working in a business. It is not directed at children and we do not knowingly collect information from them.

## Changes to this policy

When this policy changes, the date at the top changes with it. Material changes — particularly any that introduce tracking — will be described rather than quietly folded in.`,
};

export const termsOfService: PageDoc = {
  slug: "terms",
  title: "Terms of Service",
  updatedAt: LAST_UPDATED,
  seoTitle: "Terms of Service",
  seoDescription:
    "The terms for using EcomNivo's free calculators and guides, including what we do and do not warrant.",
  contentMd: `_Last updated: 12 August 2026_

By using EcomNivo you agree to these terms. If you do not agree with them, please do not use the site.

## What EcomNivo is

A free set of calculators and written guides for people selling online. There is no account to create, no subscription, and no usage limit.

## What you may do

Use the tools for your own business or your clients' businesses, commercially or otherwise. Quote our figures and cite our pages. There is no permission to request for ordinary use.

## What you may not do

- Attempt to disrupt the service, or access parts of it you have not been granted access to.
- Scrape the site at a volume that degrades it for others.
- Republish substantial portions of our written content as your own.
- Present our tools as your own product or service.

## Accuracy, and the limits of it

We take accuracy seriously. Every formula is derived by hand, published on the page that uses it, and covered by automated tests before it goes live, including the edge cases that commonly make calculators return nonsense.

Even so, the tools are provided **"as is"**. We do not warrant that a result is correct for your particular circumstances, and you use them at your own risk. The arithmetic can be right while the inputs — or the assumptions behind them — are wrong.

Check anything that matters. The formula and a worked example are published on every tool page precisely so you can.

## Not professional advice

Nothing on this site is financial, accounting, tax, legal or investment advice. The calculators perform arithmetic; they do not know your circumstances and cannot advise you. For decisions that matter, consult someone qualified.

## Limitation of liability

To the fullest extent permitted by law, EcomNivo is not liable for any loss or damage arising from your use of the site or reliance on anything published here, including lost profits, lost revenue or business interruption.

Nothing in these terms limits liability that cannot be limited by law.

## Availability

The site is provided without any guarantee of availability. We may change, suspend or discontinue any part of it, including individual tools, at any time.

## External links

Some pages may link to third-party sites. We are not responsible for their content, their accuracy, or their privacy practices.

## Changes

These terms may change. The date at the top will change with them, and continued use after a change constitutes acceptance.

${CONTACT_NOTICE}`,
};

export const disclaimer: PageDoc = {
  slug: "disclaimer",
  title: "Disclaimer",
  updatedAt: LAST_UPDATED,
  seoTitle: "Disclaimer",
  seoDescription:
    "EcomNivo's calculators are educational arithmetic tools, not financial, tax or legal advice.",
  contentMd: `_Last updated: 12 August 2026_

## These are arithmetic tools

Every calculator on EcomNivo takes numbers you supply and applies a published formula to them. It has no knowledge of your business, your market, your tax position or your obligations, and it cannot form a judgement about any of them.

A calculator can tell you that your margin is 34%. It cannot tell you whether that is good, whether to raise your prices, or what will happen if you do.

## Not professional advice

Nothing on this site constitutes financial, accounting, tax, legal or investment advice, and nothing here creates a professional relationship of any kind.

If you are making a decision with real consequences — pricing a range, committing an advertising budget, restructuring your costs — get advice from someone qualified who knows your situation.

## Results depend on your inputs

The formulas are published on each tool page and are tested. The figures you put into them are not.

The most common reason a calculation misleads is not a fault in the arithmetic but a cost left out of it: payment processing, subsidised shipping, returns, duty, or the difference between stock bought and stock sold. Each tool page lists the mistakes that specific metric invites. They are worth reading.

## No guaranteed outcomes

Nothing here is a prediction. A revenue projection shows what the arithmetic produces from the assumptions you entered, and assumptions about traffic, conversion and repeat purchase are frequently wrong. Treat projections as a way to compare scenarios, not as a forecast.

## Currency

The tools format figures in your chosen currency but **never convert between currencies**. Every formula operates on amounts in a single currency. If you mix currencies in your inputs, the result will be wrong and nothing will warn you.

## Third-party platforms

Where a tool references a platform's fee structure — Shopify's payment processing rates, for example — those figures are entered by you and default to commonly published values. Rates change, and they vary by plan, country and card type. Always check your own billing rather than relying on a default.`,
};

export const editorialPolicy: PageDoc = {
  slug: "editorial-policy",
  title: "Editorial Policy",
  updatedAt: LAST_UPDATED,
  seoTitle: "Editorial Policy",
  seoDescription:
    "How EcomNivo's calculators and guides are researched, written, verified and corrected — including how AI is used.",
  contentMd: `_Last updated: 12 August 2026_

This page describes how content on EcomNivo is produced. It is published because you should be able to judge whether to trust a figure, and that requires knowing where it came from.

## How the calculators are built

Every calculator follows the same process, in this order:

1. **The formula is derived by hand** and checked against a worked example with real numbers, before any code is written.
2. **The engine is implemented** as a small, pure function — no network calls, no hidden state.
3. **Tests are written against the hand-derived figures**, never against whatever the code returns. A test that asserts the implementation's own output proves only that the code is consistent with itself.
4. **Edge cases are covered explicitly**: zero denominators, empty fields, negative inputs, and targets that are arithmetically impossible. No calculator here may return \`NaN\` or \`Infinity\`.
5. **The formula and a worked example are published** on the page, so you can check our working rather than take it on trust.

That process is not decoration. While building this site it caught a $50 error in our own reference documentation — a figure that had been written down, reviewed, and would have shipped had the tool been built from the document instead of from first principles.

## How AI is used

AI tools are used to help draft and structure written content on this site. This is disclosed because we think you are entitled to know.

What that does **not** mean:

- Nothing is published without human review.
- No calculation is trusted because a model produced it. Every formula is verified independently and covered by tests.
- No statistic, benchmark or industry average is published unless we can point at where it came from. We would rather say "it depends on your category" than invent a number that sounds authoritative.

## What we will not publish

- **Invented statistics.** If we cannot source it, we do not state it.
- **Benchmarks presented as targets.** A "good" conversion rate or ROAS depends on your margins and your market. Publishing a single number as if it applied to everyone is misleading, and we say so on the pages where people most expect one.
- **Near-duplicate pages.** One tool, one page. No country-specific variants of the same calculator, no "free"/"online"/"2026" versions of a URL that already exists.
- **Content written for search engines rather than readers.** If a page would not be useful to someone who arrived at it deliberately, it should not exist.

## Corrections

If something here is wrong, we would rather know.

When we correct a substantive error, we change the content and update the page's date. Where a correction changes a published figure, we say what changed rather than silently editing it — the Shopify example above is documented in our own architecture notes for exactly that reason.

## Independence

Advertising and affiliate partnerships are intended to fund this site in future. Neither is active yet.

When they are: **no commercial relationship will ever influence a calculation, a recommendation, or the substance of a guide.** Advertising will be clearly distinguishable from content, and affiliate links will be disclosed on the page they appear on. See our [affiliate disclosure](/affiliate-disclosure) for more.`,
};

export const affiliateDisclosure: PageDoc = {
  slug: "affiliate-disclosure",
  title: "Affiliate Disclosure",
  updatedAt: LAST_UPDATED,
  seoTitle: "Affiliate Disclosure",
  seoDescription:
    "EcomNivo has no affiliate partnerships at present. This page sets out the rules that will apply when it does.",
  contentMd: `_Last updated: 12 August 2026_

## The current position

**EcomNivo has no affiliate partnerships and earns no commission from anything.** There are no affiliate links on this site today.

This page exists so that the rules are set out before there is any money involved, rather than written to justify decisions already made.

## What will happen when that changes

We expect to fund the site partly through affiliate partnerships. When we do, all of the following will apply.

**Disclosure will be on the page, not buried here.** Any page containing an affiliate link will say so, visibly, before or alongside the link — not only in a policy you would have to go looking for.

**Links will be technically marked.** Affiliate links carry \`rel="sponsored nofollow"\`, which tells search engines the link is commercial.

**It will never cost you more.** Affiliate commission is paid by the merchant out of their margin. You pay the same price you would by going direct.

**No commercial relationship will influence a calculation.** This is the one that matters most on a site like this. A calculator's output is arithmetic. It does not know whether a merchant pays us, and it never will.

**We will not recommend something we would not otherwise recommend.** If a tool or service is not worth using, no commission rate makes it worth writing about. If we would not suggest it to someone who asked us directly, it does not go on the site.

**Nothing will be presented as an independent review when it is not.** Comparisons, if we publish them, will state their basis and their commercial relationships.

## Advertising

Display advertising is also intended in future and is likewise not yet active. When it is, advertising will be clearly distinguishable from editorial content and will not be placed where it interferes with using a calculator.

## Why publish this now?

Because a disclosure written after the fact is worth very little. Setting out the standard while there is nothing at stake makes it possible to hold us to it later — including by pointing at this page.`,
};

export const legalPages: readonly PageDoc[] = [
  privacyPolicy,
  termsOfService,
  disclaimer,
  editorialPolicy,
  affiliateDisclosure,
];
