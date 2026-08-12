import type { ToolDefinition } from "@/lib/tools/types";
import type { CpaInput } from "@/lib/tools/engines/cpa-calculator";

export const cpaContent: ToolDefinition<CpaInput> = {
  slug: "cpa-calculator",
  h1: "CPA Calculator",
  intro:
    "Cost per acquisition is what you pay in advertising for one conversion. It is the number that decides whether a campaign is worth running, because it can be compared directly against what an order is actually worth to you.",

  formula: {
    expression: "CPA = Ad spend ÷ Conversions\n\nROAS = (Conversions × Average order value) ÷ Ad spend",
    explanation:
      "Divide what you spent by the conversions it produced. Adding an average order value lets you compare that cost against the revenue each conversion brings in, which is where CPA stops being a statistic and starts being a decision.",
  },

  example: {
    inputs: { adSpend: 500, conversions: 25, averageOrderValue: 80 },
    narrative:
      "A campaign spends 500 and produces 25 orders, so each order cost 20.00 in advertising. At an average order value of 80, those orders brought in 2,000 — a ROAS of 4.00×, and 60.00 of order value left per order after the ad cost. Whether that is profitable depends on what the goods cost.",
  },

  interpretation: [
    "Compare CPA against gross profit per order, not against revenue. An order worth 80 with a 40% margin contributes 32, so a CPA of 20 leaves 12 towards overheads.",
    "CPA rises as you scale. The cheapest conversions come first, so the figure at a small spend rarely survives a larger budget.",
    "A campaign with a high CPA can still be worth running if it brings in customers who buy repeatedly — compare against lifetime value rather than a single order.",
    "CPA counts only advertising. Your true cost of winning a customer, including tools and salaries, is the higher CAC figure.",
  ],

  commonMistakes: [
    "Comparing CPA to average order value instead of to gross profit. Revenue is not what you keep.",
    "Counting all conversions as new customers. Repeat buyers inflate the conversion count and make acquisition look cheaper than it is.",
    "Mixing conversion types. Counting newsletter sign-ups alongside purchases produces a CPA that means nothing.",
    "Ignoring the attribution window. A longer window credits more conversions to the campaign, which lowers CPA without anything actually improving.",
  ],

  faqs: [
    {
      q: "What is a good cost per acquisition?",
      a: "Any figure below your gross profit per order leaves something over; anything above it loses money on every sale. There is no universal target, because it is set by your margin — work out gross profit per order first, then judge CPA against it.",
    },
    {
      q: "What is the difference between CPA and CAC?",
      a: "CPA divides ad spend by conversions, including orders from existing customers. CAC divides all sales and marketing costs — ads, tools, salaries, agencies — by genuinely new customers only. CAC is always the larger and more honest number.",
    },
    {
      q: "Is CPA the same as cost per order?",
      a: "It is when a purchase is the conversion you are counting. CPA is a more general term: the 'acquisition' can be a sign-up, a lead or an install, so always check what the conversion is before comparing two figures.",
    },
    {
      q: "Why did my CPA jump after increasing budget?",
      a: "Because ad platforms show your ads to the most likely converters first. Expanding the budget reaches progressively less interested people, so the marginal conversion always costs more than the average one.",
    },
  ],

  relatedTools: ["cac-calculator", "cpc-calculator", "roas-calculator"],
  relatedGuides: [],

  seo: {
    title: "CPA Calculator — Cost Per Acquisition",
    description:
      "Free CPA calculator. Enter ad spend and conversions to get cost per acquisition, plus ROAS and value left per order. Formula and worked example included.",
  },
};
