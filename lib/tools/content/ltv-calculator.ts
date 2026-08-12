import type { ToolDefinition } from "@/lib/tools/types";
import type { LtvInput } from "@/lib/tools/engines/ltv-calculator";

export const ltvContent: ToolDefinition<LtvInput> = {
  slug: "ltv-calculator",
  h1: "Customer LTV Calculator",
  intro:
    "Customer lifetime value is the profit one customer contributes over the whole time they keep buying. This calculates the margin-adjusted version — the profit, not the revenue — because the revenue figure flatters every business and has led plenty of them to overspend on acquisition.",

  formula: {
    expression:
      "LTV = Average order value × Purchases per year × Lifespan in years × Gross margin\n\nLTV : CAC = LTV ÷ Customer acquisition cost",
    explanation:
      "Work out how many orders a customer places over their life, multiply by what an order is worth, then take only the share that survives as gross profit. Skipping that last step gives lifetime revenue, which is a much larger and much less useful number.",
  },

  example: {
    inputs: {
      averageOrderValue: 75,
      purchaseFrequency: 3,
      lifespanYears: 2,
      grossMargin: 45,
      cac: 50,
    },
    narrative:
      "A customer spends 75 an order, buys three times a year, and stays for two years — six orders and 450 of lifetime revenue. At a 45% gross margin, they contribute 202.50 of profit. Against a 50 acquisition cost, that is a ratio of 4.05×, comfortably above the 3× rule of thumb.",
  },

  interpretation: [
    "Use the margin-adjusted figure for decisions. Lifetime revenue ignores the cost of everything you shipped and can be twice the honest number.",
    "The ratio to acquisition cost is the point. LTV on its own says nothing about whether you can afford to grow.",
    "Payback period matters as much as the ratio. A customer worth 200 over three years does not help you pay this month's ad bill.",
    "Lifespan is the input people guess at most and get wrong most. If you do not have years of data, model a short lifespan and be pleasantly surprised.",
  ],

  commonMistakes: [
    "Using revenue instead of gross profit, which overstates LTV by however large your cost of goods is.",
    "Assuming an optimistic lifespan. Three years of assumed loyalty is easy to type and hard to earn.",
    "Applying one LTV across all customers when acquisition channels produce very different retention.",
    "Spending up to LTV today. Acquisition cost is paid now and lifetime value arrives over years, so cash flow breaks long before the ratio does.",
  ],

  faqs: [
    {
      q: "Should LTV use revenue or profit?",
      a: "Profit. Multiply lifetime revenue by your gross margin so the figure represents what the customer actually contributes. A customer generating 450 of revenue at a 45% margin is worth 202.50, not 450 — and budgeting against the larger number is how stores overspend on acquisition.",
    },
    {
      q: "What is a good LTV to CAC ratio?",
      a: "Three to one is the usual rule of thumb. Below that, acquisition is expensive relative to what customers are worth; far above it, you may be under-investing in growth. It is a guideline, and payback period matters alongside it.",
    },
    {
      q: "How do I estimate customer lifespan?",
      a: "If you have order history, look at how long it typically takes before a customer stops buying. If you do not, one over your annual churn rate gives an estimate — 50% churn implies a two-year lifespan. Err on the short side.",
    },
    {
      q: "Should I include repeat purchase rate instead of lifespan?",
      a: "They describe the same thing from different directions. Purchases per year multiplied by lifespan gives total orders per customer, which is what the formula actually needs — use whichever pair you can estimate more confidently.",
    },
  ],

  relatedTools: ["cac-calculator", "aov-calculator", "profit-margin-calculator"],
  relatedGuides: [],

  seo: {
    title: "Customer LTV Calculator — Lifetime Value and LTV:CAC",
    description:
      "Free customer lifetime value calculator. Get margin-adjusted LTV from order value, purchase frequency and lifespan, plus your LTV to CAC ratio.",
  },
};
