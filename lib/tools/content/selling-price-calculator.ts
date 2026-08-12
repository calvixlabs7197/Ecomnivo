import type { ToolDefinition } from "@/lib/tools/types";
import type { SellingPriceInput } from "@/lib/tools/engines/selling-price-calculator";

export const sellingPriceContent: ToolDefinition<SellingPriceInput> = {
  slug: "selling-price-calculator",
  h1: "Selling Price Calculator",
  intro:
    "Work out the price you need to charge to land on a target profit margin. This is the calculation people get wrong most often, because adding your target percentage to the cost does not produce that margin — it produces a smaller one.",

  formula: {
    expression: "Selling price = Total cost ÷ (1 − Target margin ÷ 100)",
    explanation:
      "Margin is a share of the selling price, not of the cost, so the price has to be divided rather than multiplied. For a 40% margin, the cost must represent the remaining 60% of the price: divide the cost by 0.60.",
  },

  example: {
    inputs: { cost: 50, additionalCosts: 0, targetMargin: 40 },
    narrative:
      "A product costs 50 and you want a 40% margin. 50 ÷ (1 − 0.40) = 50 ÷ 0.60 = 83.33. The common error is to add 40% to the cost, which gives 70 — a margin of only 28.6%, and nearly 20% of the price given away without noticing.",
  },

  interpretation: [
    "The higher the target margin, the more the correct price diverges from the naive cost-plus one. At 20% the gap is small; at 60% the correct price is more than double the cost-plus answer.",
    "Include every per-unit cost you want the price to cover. A price built on the supplier cost alone will not deliver the margin once shipping and payment fees arrive.",
    "The equivalent markup is what to enter into systems that price in markup terms — it will always be a larger percentage than the margin you asked for.",
    "This produces the price your costs require. Whether the market will pay it is a separate question, and the answer sometimes means changing the product rather than the price.",
  ],

  commonMistakes: [
    "Multiplying the cost by one plus the margin. That applies a markup, and the resulting margin is always lower than intended.",
    "Targeting a margin of 100% or more. It is arithmetically impossible — it would require the product to cost nothing.",
    "Pricing from the supplier cost alone, leaving freight, duty, payment fees and shipping to eat the margin later.",
    "Setting one target margin for every product when their cost structures differ, which quietly cross-subsidises the worst items.",
  ],

  faqs: [
    {
      q: "Why can't I just add my margin percentage to the cost?",
      a: "Because margin is measured against the selling price, not the cost. Adding 40% to a cost of 50 gives 70, and 20 of profit on a 70 price is a 28.6% margin. To actually get 40% you divide by 0.60, giving 83.33.",
    },
    {
      q: "What is the highest margin I can target?",
      a: "Anything below 100%. At exactly 100% the formula divides by zero, which would require the product to cost you nothing. In practice the ceiling is whatever your market will pay.",
    },
    {
      q: "Should I include shipping and payment fees in the cost?",
      a: "Include every cost that occurs per unit sold and that you want the margin to survive. Leaving them out is the most common reason a carefully priced product turns out to be barely profitable.",
    },
    {
      q: "How do I go from a target margin to a markup?",
      a: "Markup = margin ÷ (100 − margin) × 100. A 40% margin is a 66.7% markup. This calculator shows the equivalent markup alongside the price.",
    },
  ],

  relatedTools: ["markup-calculator", "profit-margin-calculator", "product-profit-calculator"],
  relatedGuides: [],

  seo: {
    title: "Selling Price Calculator — Price for a Target Margin",
    description:
      "Free selling price calculator. Enter your cost and target profit margin to get the price you need to charge, plus the equivalent markup. Formula included.",
  },
};
