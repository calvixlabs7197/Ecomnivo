import type { ToolDefinition } from "@/lib/tools/types";
import type { EcommerceProfitInput } from "@/lib/tools/engines/ecommerce-profit-calculator";

export const ecommerceProfitContent: ToolDefinition<EcommerceProfitInput> = {
  slug: "ecommerce-profit-calculator",
  h1: "E-commerce Profit Calculator",
  intro:
    "Revenue is not profit. This works out what your store actually keeps once the cost of goods, shipping, payment processing, advertising and everything else has come out — and what share of each sale that represents.",

  formula: {
    expression:
      "Net profit = Revenue − (Cost of goods + Shipping + Transaction fees + Advertising + Other costs)\n\nNet margin = Net profit ÷ Revenue × 100",
    explanation:
      "Add up every cost that the period's sales incurred, and subtract the total from revenue. Expressing the result as a share of revenue gives the net margin, which is what lets you compare a good month against a big one.",
  },

  example: {
    inputs: {
      revenue: 10000,
      cogs: 4000,
      shipping: 800,
      transactionFees: 300,
      adSpend: 2000,
      otherCosts: 500,
    },
    narrative:
      "A store turns over 10,000 in a month. Products cost 4,000, shipping and fulfilment 800, payment processing 300, advertising 2,000, and software and contractors another 500 — 7,600 in total. Net profit is 10,000 − 7,600 = 2,400, a net margin of 24%. Gross profit, which stops after the cost of goods, is 6,000 — two and a half times the figure that actually reaches the bank.",
  },

  interpretation: [
    "Net margin is the number to track over time. Profit in currency terms rises with volume, so it can improve while the business is getting less efficient.",
    "The gap between gross profit and net profit is what your operation costs to run. If it is widening, costs are growing faster than sales.",
    "Advertising is usually the largest lever here and the fastest to change. Work out your break-even ROAS before cutting it — some of that spend is paying for itself.",
    "A negative result is not automatically a failure for a growing store, but it needs to be a deliberate choice with a defined end, not a surprise at the end of the month.",
  ],

  commonMistakes: [
    "Leaving out payment processing. At roughly 2–3% of revenue it is easy to overlook and it comes straight off the bottom line.",
    "Using revenue before returns and discounts, which overstates both profit and margin — badly so in categories where returns are common.",
    "Counting stock you bought rather than stock you sold. Cost of goods should cover the items sold in the period, not everything purchased in it.",
    "Forgetting shipping you subsidised. Free delivery is a real cost, and it belongs here even though the customer never sees a line for it.",
    "Treating gross profit as profit. It ignores every cost of actually running the store.",
  ],

  faqs: [
    {
      q: "What is a good net profit margin for an e-commerce store?",
      a: "It varies enormously by category, price point and business model, so a single benchmark would be misleading. The more useful comparison is your own margin over time, and whether it covers the fixed costs and the owner's income the business needs to support.",
    },
    {
      q: "What is the difference between gross profit and net profit?",
      a: "Gross profit is revenue less the cost of goods sold. Net profit continues, subtracting shipping, transaction fees, advertising and every other operating cost. Gross profit tells you whether the product economics work; net profit tells you whether the business does.",
    },
    {
      q: "Should I include my own salary?",
      a: "If you pay yourself, include it under other costs — otherwise the business looks more profitable than it is. If you do not yet, it is worth running the figure both ways so you know what the business would earn once your time is properly costed.",
    },
    {
      q: "Does this handle tax?",
      a: "No. It works on figures excluding sales tax and VAT, and it does not deduct corporation or income tax. The result is profit before tax.",
    },
  ],

  relatedTools: ["profit-margin-calculator", "break-even-roas-calculator", "roas-calculator"],
  relatedGuides: [],

  seo: {
    title: "E-commerce Profit Calculator — Net Profit and Margin",
    description:
      "Free e-commerce profit calculator. Work out net profit and margin after cost of goods, shipping, transaction fees and ad spend. Formula and worked example included.",
  },
};
