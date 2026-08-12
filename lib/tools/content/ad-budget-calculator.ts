import type { ToolDefinition } from "@/lib/tools/types";
import type { AdBudgetInput } from "@/lib/tools/engines/ad-budget-calculator";

export const adBudgetContent: ToolDefinition<AdBudgetInput> = {
  slug: "ad-budget-calculator",
  h1: "Ad Budget Calculator",
  intro:
    "Work backwards from a revenue goal to the advertising budget it requires. Enter what you want ads to generate and the return you realistically expect, and this gives you the total spend and what it comes to per day.",

  formula: {
    expression:
      "Total budget = Revenue goal ÷ Target ROAS\n\nDaily budget = Total budget ÷ Days",
    explanation:
      "ROAS is revenue divided by spend, so rearranging it gives spend as revenue divided by ROAS. The realism of the answer depends entirely on the realism of the target ROAS — use what your campaigns actually achieve, not what you would like them to.",
  },

  example: {
    inputs: { revenueGoal: 50000, targetRoas: 4, days: 30 },
    narrative:
      "A store wants 50,000 of revenue from advertising over 30 days and its campaigns reliably return 4.00×. 50,000 ÷ 4 = 12,500 of ad spend, which is 416.67 a day. If the real return turns out to be 3.00×, the same goal needs 16,667 — a third more budget for the same result.",
  },

  interpretation: [
    "This is a planning figure, not a guarantee. It assumes your ROAS holds as spend increases, and it usually does not.",
    "Check the target ROAS against your break-even ROAS before committing. A budget built on a target below break-even funds a loss with great precision.",
    "Expect efficiency to fall as budget rises. If you are planning a large increase, model the goal at a lower ROAS as well and see whether it still makes sense.",
    "The daily figure matters for pacing. Ad platforms spend to a daily budget, and a month's budget released all at once tends to be spent badly.",
  ],

  commonMistakes: [
    "Using an aspirational ROAS. The budget that comes out is only as realistic as the number that went in.",
    "Planning a budget without checking break-even ROAS first, so the plan is profitable only in the spreadsheet.",
    "Forgetting that the revenue goal here is revenue from advertising, not total store revenue. Organic and returning-customer sales should not be in the target.",
    "Treating the daily figure as fixed. Demand is seasonal and weekly — a flat daily budget under-spends at peaks and over-spends in the troughs.",
  ],

  faqs: [
    {
      q: "How do I choose a target ROAS?",
      a: "Start with your break-even ROAS, which is 1 divided by your gross margin, then set the target above it by enough to cover fixed costs and leave a profit. Sense-check the result against what your campaigns have actually delivered over the last few months.",
    },
    {
      q: "Should the budget include agency fees or creative costs?",
      a: "Not in this calculation — it works out media spend, which is what ROAS is measured against. Include those costs when you work out customer acquisition cost or overall profitability.",
    },
    {
      q: "Why does my actual spend never match the plan?",
      a: "Ad platforms pace against a daily budget and can overspend on a given day while balancing over a longer period, and auction prices move. Treat the daily figure as an average to steer by rather than a cap.",
    },
    {
      q: "Can I use this to work out revenue from a fixed budget instead?",
      a: "Yes — multiply rather than divide. Budget × target ROAS gives the revenue that budget should produce, which is a useful sanity check when the budget is set for you.",
    },
  ],

  relatedTools: ["roas-calculator", "break-even-roas-calculator", "cpa-calculator"],
  relatedGuides: [],

  seo: {
    title: "Ad Budget Calculator — Budget From a Revenue Goal",
    description:
      "Free ad budget calculator. Enter a revenue goal and target ROAS to get the total and daily ad spend required. Formula and worked example included.",
  },
};
