import type { ToolDefinition } from "@/lib/tools/types";
import type { CacInput } from "@/lib/tools/engines/cac-calculator";

export const cacContent: ToolDefinition<CacInput> = {
  slug: "cac-calculator",
  h1: "CAC Calculator",
  intro:
    "Customer acquisition cost is what it truly costs to win one new customer — not just the ad spend, but the tools, agencies and salaries behind it. It is the number to set against lifetime value when deciding how much growth you can afford.",

  formula: {
    expression:
      "CAC = (Marketing costs + Sales costs) ÷ New customers\n\nLTV : CAC = Customer lifetime value ÷ CAC",
    explanation:
      "Add every cost incurred to attract and convert customers over a period, then divide by the number of genuinely new customers won in that period. Only first-time customers count — including repeat orders would make acquisition look far cheaper than it is.",
  },

  example: {
    inputs: {
      marketingCosts: 6000,
      salesCosts: 4000,
      newCustomers: 200,
      customerLifetimeValue: 202.5,
    },
    narrative:
      "A store spends 6,000 on marketing and 4,000 on sales costs in a month, and wins 200 first-time customers. 10,000 ÷ 200 = 50.00 per customer. Against a lifetime value of 202.50, that is a ratio of 4.05× — comfortably above the 3× rule of thumb.",
  },

  interpretation: [
    "CAC is only meaningful next to lifetime value. A CAC of 200 is excellent if customers are worth 800 and ruinous if they are worth 150.",
    "The commonly cited target is an LTV to CAC ratio of 3 or better. Treat it as a starting point rather than a rule — the right figure depends on your margins and how quickly you recover the cost.",
    "A ratio far above 3 is not automatically good news. It often means you are under-investing in growth and leaving demand unserved.",
    "How long CAC takes to pay back matters as much as the ratio. A business that recovers acquisition cost on the first order can grow from cash flow; one that waits a year cannot.",
  ],

  commonMistakes: [
    "Counting only ad spend. Leaving out salaries, agencies and software understates CAC, sometimes by more than half.",
    "Dividing by all customers rather than new ones. Repeat orders are not acquisitions.",
    "Comparing CAC against revenue per customer instead of margin-adjusted lifetime value — the revenue figure ignores the cost of everything you shipped.",
    "Mismatching periods. Costs spent this month often win customers next month, so a single month in isolation can mislead badly in a business with a long consideration cycle.",
  ],

  faqs: [
    {
      q: "What should I include in CAC?",
      a: "Every cost incurred to attract and convert new customers: advertising, agency fees, marketing and sales salaries, commission, content production, and the software those teams use. Exclude the cost of serving customers after they have bought — that belongs in your profit calculation.",
    },
    {
      q: "What is a good LTV to CAC ratio?",
      a: "Three to one is the figure most often quoted, meaning a customer is worth three times what they cost to acquire. It is a rule of thumb rather than a law: the right ratio depends on your gross margin, how long payback takes, and how much capital you have to fund growth.",
    },
    {
      q: "How is CAC different from CPA?",
      a: "CPA divides ad spend by conversions, which includes orders from customers you already had. CAC divides total sales and marketing cost by new customers only. CAC is always higher, and it is the figure to use for decisions about growth.",
    },
    {
      q: "Should I calculate CAC by channel?",
      a: "Where you can, yes — blended CAC hides the fact that one channel is subsidising another. Be careful attributing shared costs like salaries, and be honest that channels influence each other rather than working in isolation.",
    },
  ],

  relatedTools: ["ltv-calculator", "cpa-calculator", "ecommerce-profit-calculator"],
  relatedGuides: [],

  seo: {
    title: "CAC Calculator — Customer Acquisition Cost",
    description:
      "Free CAC calculator. Enter sales and marketing costs and new customers to get acquisition cost and your LTV to CAC ratio. Formula and worked example included.",
  },
};
