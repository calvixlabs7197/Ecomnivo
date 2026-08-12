import type { PageDoc } from "@/lib/content/types";

export const aboutPage: PageDoc = {
  slug: "about",
  title: "About EcomNivo",
  updatedAt: "2026-08-12",
  seoTitle: "About EcomNivo",
  seoDescription:
    "What EcomNivo is, how the calculators are built and verified, what we deliberately do not do, and how the site is funded.",
  contentMd: `EcomNivo is a free set of calculators for people who sell online. It exists because the numbers that decide whether a store makes money — margin, ROAS, break-even, true per-unit cost — are simple arithmetic that is surprisingly easy to get wrong, and most of the calculators that answer them show you a figure without showing their working.

## How the tools are built

Every formula is derived by hand and checked against a worked example before any code is written. The calculation itself is a small, pure function covered by unit tests — including the awkward inputs, like a zero denominator or an impossible target margin, that make many calculators return \`NaN\` or a confidently wrong number.

Each tool page shows the formula it uses, a worked example with real figures, and an explanation of how to read the result. If you disagree with our maths, you can see exactly where we got it from.

That process earns its keep. While building this site it caught a $50 error in our own reference documentation — a figure that had been written down and reviewed, and would have shipped had the calculator been built from the document rather than from first principles.

Calculations run entirely in your browser. Your inputs are never sent to us and never stored.

## What we deliberately do not do

**Convert currencies.** You can display results in USD, GBP, EUR, CAD or AUD, but the calculators never convert between them. Every formula here works on figures in a single currency, so an exchange rate would add a source of staleness and error without adding any accuracy.

**Publish near-duplicate pages.** No country-specific versions of the same calculator, no "free" / "online" / "2026" variants of one URL. One tool, one page.

**Give financial advice.** These are arithmetic tools. They can tell you what your margin is; they cannot tell you what to do about it, and nothing here is financial, tax or legal advice.

**Invent statistics.** We do not publish benchmark figures or industry averages unless we can point at where they came from. On the questions where people most want a single number — what is a good ROAS, what is a good conversion rate — the honest answer is that it depends on your margins and your market, and that is what we say.

## How content is produced

AI tools are used to help draft and structure written content. Nothing is published without human review, and every calculation is verified independently of whatever produced the first draft. The full [editorial policy](/editorial-policy) sets out the process, including how corrections are handled.

## How EcomNivo is funded

The site will be supported by advertising and affiliate partnerships. **Neither is live yet.**

When they are: ad placements will stay clear of the calculators rather than interrupting them, affiliate links will be marked as sponsored and disclosed on the page they appear on, and no result a calculator produces will ever be influenced by a commercial relationship. The [affiliate disclosure](/affiliate-disclosure) sets out those rules in full — published now, while there is nothing at stake, so we can be held to them later.`,
};
