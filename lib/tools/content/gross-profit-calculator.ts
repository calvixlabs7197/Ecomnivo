import type { ToolDefinition } from "@/lib/tools/types";
import type { GrossProfitInput } from "@/lib/tools/engines/gross-profit-calculator";

export const grossProfitContent: ToolDefinition<GrossProfitInput> = {
  slug: "gross-profit-calculator",
  h1: "Gross Profit Calculator",
  intro:
    "Gross profit is what is left after the cost of the goods you sold, before any of the cost of running the business. It is the ceiling on everything else — no amount of efficiency elsewhere can rescue a product whose gross margin is too thin.",

  formula: {
    expression:
      "Gross profit = Revenue − Cost of goods sold\n\nGross margin = Gross profit ÷ Revenue × 100",
    explanation:
      "Cost of goods sold covers only the direct cost of the products sold in the period — what you paid for them, or what the materials and labour to make them cost. Rent, salaries, software and advertising are operating expenses and belong further down.",
  },

  example: {
    inputs: { revenue: 100000, cogs: 62000 },
    narrative:
      "A store turns over 100,000 and the goods it sold cost 62,000. Gross profit is 38,000, a gross margin of 38%. That 38,000 is everything available to cover staff, rent, software, advertising and profit — if those come to more than 38,000, the business loses money regardless of how well it is run.",
  },

  interpretation: [
    "Gross margin sets your break-even ROAS. At 38%, advertising has to return 1 ÷ 0.38 = 2.63× before it contributes anything.",
    "It is the most useful margin for comparing products and periods, because it is unaffected by how you happen to structure overheads.",
    "A falling gross margin at steady revenue means either supplier costs are rising or you are discounting more. Both are worth catching early.",
    "Very high gross margins are normal in some categories and impossible in others. Compare against your own history, not across industries.",
  ],

  commonMistakes: [
    "Including operating expenses in cost of goods. Advertising, salaries and rent are not the cost of the goods, and including them turns gross profit into something closer to net.",
    "Using stock purchased rather than stock sold. Cost of goods should match the items sold in the period, not everything bought in it.",
    "Using revenue before returns and discounts, which overstates both the profit and the margin.",
    "Treating gross profit as money available to take out of the business. Every operating cost still has to come out of it.",
  ],

  faqs: [
    {
      q: "What is the difference between gross profit and net profit?",
      a: "Gross profit subtracts only the cost of the goods sold. Net profit continues, subtracting every operating expense — salaries, rent, software, advertising and fulfilment. Gross profit tells you whether the product economics work; net profit tells you whether the business does.",
    },
    {
      q: "What should be in cost of goods sold?",
      a: "The direct cost of the products sold: the purchase price from your supplier, or the materials and direct labour to make them, plus inbound freight and import duties. Anything that would still be spent if you sold nothing does not belong.",
    },
    {
      q: "Should shipping to the customer be in cost of goods?",
      a: "Practice varies. Many stores treat outbound shipping as an operating cost rather than part of cost of goods. Whichever you choose, be consistent — otherwise your margin will appear to move when nothing has actually changed.",
    },
    {
      q: "What is a good gross margin?",
      a: "It varies enormously by category — a business reselling branded goods works on very different margins from one making its own. The figure that matters is whether your gross profit covers your operating costs with enough left over, not how you compare to a published average.",
    },
  ],

  relatedTools: ["net-profit-calculator", "profit-margin-calculator", "break-even-roas-calculator"],
  relatedGuides: [],

  seo: {
    title: "Gross Profit Calculator — Gross Profit and Margin",
    description:
      "Free gross profit calculator. Enter revenue and cost of goods sold to get gross profit and gross margin. Formula and worked example included.",
  },
};
