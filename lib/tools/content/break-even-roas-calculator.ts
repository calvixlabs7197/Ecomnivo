import type { ToolDefinition } from "@/lib/tools/types";
import type { BreakEvenRoasInput } from "@/lib/tools/engines/break-even-roas-calculator";

export const breakEvenRoasContent: ToolDefinition<BreakEvenRoasInput> = {
  slug: "break-even-roas-calculator",
  h1: "Break-Even ROAS Calculator",
  intro:
    "Break-even ROAS is the return on ad spend at which a campaign stops losing money and starts making it. It is set entirely by your gross margin, not by any industry benchmark. Enter your selling price and unit costs to find yours.",

  formula: {
    expression:
      "Break-even ROAS = 1 ÷ Gross margin\n\nwhere  Gross margin = (Price − Cost of goods − Variable costs) ÷ Price",
    explanation:
      "Work out the share of each sale left over after the costs of delivering it, then invert that share. If 40% of the price survives as gross profit, you need to generate 1 ÷ 0.40 = 2.50 in revenue for every 1 of ad spend just to cover the advertising. The same result comes from dividing the price by the gross profit per unit.",
  },

  example: {
    inputs: { price: 100, cogs: 55, variableCosts: 5 },
    narrative:
      "A product sells for 100. It costs 55 to buy and another 5 in shipping, packaging and payment fees, leaving 40 of gross profit — a 40% margin. Break-even ROAS is 1 ÷ 0.40 = 2.50×. A campaign running at 2.00× is losing money on every order, even though it returns twice what it costs in ad spend.",
  },

  interpretation: [
    "This is a floor, not a target. At exactly break-even the campaign contributes nothing to overheads, salaries, software or profit.",
    "The thinner your margin, the higher the bar. A 20% margin needs 5.00×; a 60% margin needs only 1.67×. This is why margin improvements are worth more than they look.",
    "Set your actual target above break-even by whatever your fixed costs and profit expectations require. Many sellers aim for at least 1.5 times their break-even figure.",
    "If your break-even ROAS is higher than what your campaigns realistically achieve, the problem is the product's economics, not the ad account.",
  ],

  commonMistakes: [
    "Using markup where margin is required. A product bought at 55 and sold at 100 carries an 82% markup but a 45% margin — using 82% here would give you a break-even ROAS that is far too optimistic.",
    "Forgetting payment processing and shipping. They are small per unit and easy to omit, but on a thin margin they move break-even materially.",
    "Applying one break-even ROAS across a whole catalogue. If margins vary by product, so does the figure, and a blended number will quietly overspend on your worst items.",
    "Ignoring returns. In categories with high return rates, the effective margin is lower than the per-unit calculation suggests.",
  ],

  faqs: [
    {
      q: "What is break-even ROAS?",
      a: "It is the return on ad spend at which advertising exactly pays for itself — the revenue generated covers the cost of the goods, the variable costs of delivering them, and the ad spend, with nothing left over. It equals 1 divided by your gross margin.",
    },
    {
      q: "Should my target ROAS be the same as my break-even ROAS?",
      a: "No. Break-even leaves nothing for rent, staff, software, or profit. Treat it as the floor and set your target above it by enough to cover fixed costs and the margin you want to earn.",
    },
    {
      q: "Do I include my own time or fixed costs in this calculation?",
      a: "Not here. This uses variable costs — those that occur per unit sold. Fixed costs such as salaries and subscriptions do not change with one extra order, so they belong in a full profit calculation rather than in the break-even ROAS figure.",
    },
    {
      q: "Why is my break-even ROAS so high?",
      a: "Because your gross margin is low. The relationship is not linear: as margin falls, the required ROAS climbs steeply. Going from a 40% to a 20% margin doubles the required ROAS from 2.50× to 5.00×.",
    },
  ],

  relatedTools: ["roas-calculator", "profit-margin-calculator", "ecommerce-profit-calculator"],
  relatedGuides: [],

  seo: {
    title: "Break-Even ROAS Calculator — Find Your Minimum ROAS",
    description:
      "Free break-even ROAS calculator. Enter your price and unit costs to find the minimum return on ad spend your margin requires, with the formula and a worked example.",
  },
};
