import type { ToolDefinition } from "@/lib/tools/types";
import type { AovInput } from "@/lib/tools/engines/aov-calculator";

export const aovContent: ToolDefinition<AovInput> = {
  slug: "aov-calculator",
  h1: "AOV Calculator",
  intro:
    "Average order value is what a typical order is worth. It is the quietest of the growth levers and often the most profitable one — raising it earns more from the customers you already have, with no extra traffic and no extra acquisition cost.",

  formula: {
    expression: "Average order value = Revenue ÷ Orders",
    explanation:
      "Divide revenue by the number of orders that produced it, over the same period. Use revenue after discounts and returns, or the figure will flatter you in exactly the categories where returns matter most.",
  },

  example: {
    inputs: { revenue: 45000, orders: 600, targetAov: 85 },
    narrative:
      "A store takes 45,000 across 600 orders, so the average order is worth 75.00. Lifting that to 85 against the same 600 orders would bring in 51,000 — 6,000 more revenue with no additional traffic, no additional ad spend and no additional acquisition cost.",
  },

  interpretation: [
    "Extra revenue from a higher average order value carries no acquisition cost, so it is more profitable than the same revenue from more orders.",
    "A higher average order value raises what you can afford to pay for a customer, which widens the range of campaigns that work.",
    "The average hides its own distribution. A handful of very large orders can pull it up while most customers spend far less — check the median too if you can.",
    "Bundles, volume discounts and free-shipping thresholds all move this figure, but each has a margin cost. Check profit per order, not just order value.",
  ],

  commonMistakes: [
    "Using revenue before discounts and returns, which overstates the average and hides a discounting problem.",
    "Including shipping charges paid by the customer in revenue but not in the comparison period's costs, which quietly inflates the figure.",
    "Chasing average order value with heavy discounts on bundles, so orders get bigger and profit per order gets smaller.",
    "Comparing across periods that include a sale event without saying so — promotions usually raise order counts and lower the average.",
  ],

  faqs: [
    {
      q: "How can I increase average order value?",
      a: "The usual levers are product bundles, volume pricing, a free-shipping threshold set slightly above the current average, and relevant cross-sells at the cart. Each trades some margin for order size, so check profit per order rather than order value alone.",
    },
    {
      q: "Should shipping charges be included in the revenue?",
      a: "Be consistent, and know which you have chosen. Including customer-paid shipping raises the figure without the product mix changing, so if you include it, include it in every period you compare against.",
    },
    {
      q: "Is average order value the same as revenue per visitor?",
      a: "No. Average order value is per order; revenue per visitor is per session and includes everyone who did not buy. Revenue per visitor is average order value multiplied by conversion rate.",
    },
    {
      q: "Why is my average order value falling while revenue rises?",
      a: "Usually a change in mix — a cheaper product selling well, a promotion, or traffic from a channel with different intent. It is not automatically bad, provided profit is moving the right way.",
    },
  ],

  relatedTools: ["revenue-calculator", "conversion-rate-calculator", "ltv-calculator"],
  relatedGuides: [],

  seo: {
    title: "AOV Calculator — Average Order Value",
    description:
      "Free average order value calculator. Enter revenue and order count to get your AOV, and see the revenue a higher target would produce.",
  },
};
