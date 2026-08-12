import type { ToolDefinition } from "@/lib/tools/types";
import type { ProfitMarginInput } from "@/lib/tools/engines/profit-margin-calculator";

export const profitMarginContent: ToolDefinition<ProfitMarginInput> = {
  slug: "profit-margin-calculator",
  h1: "Profit Margin Calculator",
  intro:
    "Profit margin is the share of each sale you keep. Enter what you sold something for and what it cost you, and this gives the margin as a percentage — alongside the markup on the same figures, because the two are routinely confused and they are never the same number.",

  formula: {
    expression:
      "Profit margin = (Revenue − Cost) ÷ Revenue × 100\n\nMarkup = (Revenue − Cost) ÷ Cost × 100",
    explanation:
      "Both start from the same profit. Margin divides it by the selling price, markup divides it by the cost. Because the selling price is the larger denominator, margin is always the smaller percentage — and the gap widens as the product becomes more profitable.",
  },

  example: {
    inputs: { revenue: 100, cost: 60 },
    narrative:
      "An item costs 60 and sells for 100, so the profit is 40. As a share of the 100 selling price that is a 40% margin. As a share of the 60 cost it is a 66.7% markup. Same product, same profit, two very different-looking percentages — which is why applying a '50% markup' when you meant a 50% margin leaves you charging 90 instead of 120.",
  },

  interpretation: [
    "Margin answers 'how much of each sale do I keep?'. Markup answers 'how much did I add to my cost?'. Pricing conversations go wrong when the two get swapped.",
    "Which costs you include defines which margin you get. Cost of goods only gives gross margin; adding every operating cost gives net margin.",
    "Margin cannot reach 100%, because that would require the cost to be zero. Markup has no ceiling.",
    "A small margin improvement is worth more than the same-sized revenue increase, because it applies to every future sale without needing more traffic.",
  ],

  commonMistakes: [
    "Using markup and margin interchangeably. A 50% markup produces a 33.3% margin, not 50% — the gap is entirely profit you thought you had.",
    "Dividing profit by cost and calling it margin. That is the markup formula, and it always flatters the result.",
    "Leaving out payment processing, shipping and returns, then wondering why the margin on the spreadsheet never shows up in the bank.",
    "Setting prices from a target markup when the business is planning against a target margin.",
  ],

  faqs: [
    {
      q: "What is the difference between margin and markup?",
      a: "Margin is profit as a share of the selling price; markup is profit as a share of the cost. An item bought at 60 and sold at 100 has a 40% margin and a 66.7% markup. Margin is always the lower figure.",
    },
    {
      q: "How do I work out the price I need for a target margin?",
      a: "Divide the cost by one minus the margin as a decimal. For a 40% margin on a 60 cost: 60 ÷ 0.60 = 100. A common error is to add 40% to the cost, which gives 84 and a margin of only 28.6%.",
    },
    {
      q: "Should I use gross or net margin?",
      a: "Gross margin, which counts only the cost of goods, is the right measure for pricing and product decisions. Net margin, which counts every operating cost, is the right measure for the health of the business. Both are useful; they answer different questions.",
    },
    {
      q: "Can profit margin be negative?",
      a: "Yes. If cost exceeds revenue the margin is negative, meaning you lose money on every sale. It happens more often than expected once discounting, shipping subsidies and return costs are included.",
    },
  ],

  relatedTools: ["ecommerce-profit-calculator", "break-even-roas-calculator", "roas-calculator"],
  relatedGuides: [],

  seo: {
    title: "Profit Margin Calculator — Margin and Markup",
    description:
      "Free profit margin calculator. Enter revenue and cost to get your margin percentage, the profit, and the equivalent markup. Formula and example included.",
  },
};
