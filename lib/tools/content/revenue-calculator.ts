import type { ToolDefinition } from "@/lib/tools/types";
import type { RevenueInput } from "@/lib/tools/engines/revenue-calculator";

export const revenueContent: ToolDefinition<RevenueInput> = {
  slug: "revenue-calculator",
  h1: "Revenue Calculator",
  intro:
    "E-commerce revenue comes from exactly three things: how many people visit, how many of them buy, and how much they spend. This projects revenue from those three inputs — and shows you which one is worth working on.",

  formula: {
    expression:
      "Revenue = Sessions × (Conversion rate ÷ 100) × Average order value\n\nOrders = Sessions × (Conversion rate ÷ 100)",
    explanation:
      "The three levers multiply, which is why they are worth so much more together than separately. A 10% improvement in each does not add 30% — it compounds to a 33% increase in revenue.",
  },

  example: {
    inputs: { sessions: 25000, conversionRate: 1.8, averageOrderValue: 75 },
    narrative:
      "25,000 sessions converting at 1.8% produce 450 orders. At an average order value of 75, that is 33,750 of revenue, or 1.35 per session. Improving each lever by 10% — 27,500 sessions, 1.98%, 82.50 — gives 44,921, a third more revenue.",
  },

  interpretation: [
    "Revenue per session is the most useful by-product here. It is the ceiling on what a visit is worth buying, and it makes traffic sources directly comparable.",
    "Traffic is usually the most expensive lever and conversion rate the cheapest. Doubling traffic doubles cost; improving conversion costs the same whatever your volume.",
    "The three inputs are not independent. Aggressive traffic growth tends to lower conversion rate, and discounting lifts conversion while lowering order value.",
    "This is a projection, not a forecast. It is at its most useful for comparing scenarios, not for predicting a specific month.",
  ],

  commonMistakes: [
    "Assuming the three levers hold steady while one is scaled. More traffic almost always converts worse.",
    "Entering conversion rate as a decimal when the field expects a percentage — 0.018 instead of 1.8 understates revenue a hundredfold.",
    "Projecting from a period that included a promotion, which is not representative of a normal month.",
    "Treating revenue as the goal. Revenue bought with discounts or unprofitable ads is not progress.",
  ],

  faqs: [
    {
      q: "Which lever should I work on first?",
      a: "Usually conversion rate, because it is the cheapest to improve and it lowers your cost per order at the same time. Average order value is next, since it earns more from customers you have already paid to acquire. Traffic is generally the most expensive.",
    },
    {
      q: "What is revenue per session useful for?",
      a: "It tells you the most you could pay for a visit before losing money on it — the gross-profit-adjusted version is the real ceiling. It also lets you compare traffic sources of very different sizes on equal terms.",
    },
    {
      q: "Can I work backwards from a revenue target?",
      a: "Yes. Divide the target by average order value to get the orders required, then divide by conversion rate to get the sessions. It is a quick way to see whether a target implies a plausible amount of traffic.",
    },
    {
      q: "Does this include tax or shipping?",
      a: "Only in so far as they are in the average order value you enter. Keep it consistent with how you measure revenue elsewhere, and prefer figures excluding sales tax and VAT.",
    },
  ],

  relatedTools: ["conversion-rate-calculator", "aov-calculator", "ecommerce-profit-calculator"],
  relatedGuides: [],

  seo: {
    title: "Revenue Calculator — Project Store Revenue",
    description:
      "Free e-commerce revenue calculator. Project revenue from sessions, conversion rate and average order value, with revenue per session alongside.",
  },
};
