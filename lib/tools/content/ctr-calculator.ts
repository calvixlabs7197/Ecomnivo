import type { ToolDefinition } from "@/lib/tools/types";
import type { CtrInput } from "@/lib/tools/engines/ctr-calculator";

export const ctrContent: ToolDefinition<CtrInput> = {
  slug: "ctr-calculator",
  h1: "CTR Calculator",
  intro:
    "Click-through rate is the share of people who saw your ad and clicked it. It is the clearest single signal of whether your creative and targeting match — and because it sits between impressions and clicks, improving it lowers your cost per click without renegotiating anything.",

  formula: {
    expression: "CTR = (Clicks ÷ Impressions) × 100",
    explanation:
      "Divide clicks by the number of times the ad was shown, then express it as a percentage. The same formula works for ads, email, search listings and product tiles — only the definition of an impression changes.",
  },

  example: {
    inputs: { impressions: 100000, clicks: 1250, targetCtr: 2 },
    narrative:
      "An ad is shown 100,000 times and clicked 1,250 times: 1,250 ÷ 100,000 = 1.25%. Lifting that to 2% against the same impressions would produce 2,000 clicks — 750 more, at no extra media cost.",
  },

  interpretation: [
    "Click-through rate is a relevance signal. A low rate usually means the creative, the offer or the audience is wrong, and no amount of bidding fixes that.",
    "At a fixed CPM, click-through rate and cost per click are inversely proportional: doubling the rate halves the click price.",
    "A very high rate with poor conversion often means the ad is promising something the landing page does not deliver.",
    "Rates are not comparable across surfaces. Search ads against high-intent queries routinely beat display placements by an order of magnitude, and neither number tells you anything about the other.",
  ],

  commonMistakes: [
    "Comparing your rate to a published benchmark that mixes search, social and display. Those are different products with different expectations.",
    "Optimising for clicks alone. Clickbait creative lifts the rate and damages conversion rate and margin at the same time.",
    "Using users instead of impressions. One person shown an ad five times is five impressions, and mixing the two overstates your rate.",
    "Reading too much into a rate calculated from a few hundred impressions — the number is mostly noise at that volume.",
  ],

  faqs: [
    {
      q: "What is a good click-through rate?",
      a: "It depends on the surface. Paid search against high-intent queries often runs several percent; social and display placements are typically well under one percent. The comparison that matters is your own rate over time on the same placement, and whether the clicks it produces convert.",
    },
    {
      q: "Does click-through rate affect what I pay?",
      a: "Yes, in two ways. Mechanically, a higher rate means more clicks from the same impressions, so your cost per click falls. Separately, most ad platforms factor expected engagement into auction ranking, so relevant ads tend to win placements more cheaply.",
    },
    {
      q: "Should I optimise for click-through rate?",
      a: "Only as far as it serves the outcome you actually want. Rate is a means, not an end — a campaign with a lower rate and a much better conversion rate is the better campaign.",
    },
    {
      q: "How many impressions do I need before the number means anything?",
      a: "There is no single threshold, but a rate calculated from a few hundred impressions moves wildly with a handful of clicks. Wait for a few thousand impressions before drawing conclusions or making changes.",
    },
  ],

  relatedTools: ["cpc-calculator", "cpm-calculator", "conversion-rate-calculator"],
  relatedGuides: [],

  seo: {
    title: "CTR Calculator — Work Out Click-Through Rate",
    description:
      "Free CTR calculator. Enter impressions and clicks to get your click-through rate, and see how many clicks a target rate would add. Formula and example included.",
  },
};
