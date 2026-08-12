import type { ToolDefinition } from "@/lib/tools/types";
import type { NetProfitInput } from "@/lib/tools/engines/net-profit-calculator";

export const netProfitContent: ToolDefinition<NetProfitInput> = {
  slug: "net-profit-calculator",
  h1: "Net Profit Calculator",
  intro:
    "Net profit is the bottom line: what remains after the cost of goods and every expense of running the business. It is the only profit figure that answers the question the owner actually cares about.",

  formula: {
    expression:
      "Net profit = Revenue − (Cost of goods + Operating expenses + Other expenses)\n\nNet margin = Net profit ÷ Revenue × 100",
    explanation:
      "Everything comes out. Operating expenses cover the cost of running the business — salaries, rent, software, advertising, fulfilment — while other expenses catch interest and one-off items. What is left is profit before tax.",
  },

  example: {
    inputs: { revenue: 100000, cogs: 62000, operatingExpenses: 21000, otherExpenses: 5000 },
    narrative:
      "A store turns over 100,000. Goods cost 62,000, leaving 38,000 of gross profit. Operating expenses take 21,000 and other costs another 5,000, so net profit is 12,000 — a net margin of 12%. Gross margin was 38%, which shows how much of it running the business consumes.",
  },

  interpretation: [
    "Net margin is the number to track over time. Absolute profit grows with volume, so it can rise while the business becomes less efficient.",
    "The gap between gross and net margin is the cost of your operation. Widening at steady revenue means costs are outgrowing sales.",
    "A thin net margin leaves no room for error. A supplier price rise or a bad month can move a 3% margin negative; it barely dents a 20% one.",
    "Net profit is not cash. Stock purchases, loan repayments and tax all move money without appearing here.",
  ],

  commonMistakes: [
    "Not paying yourself. If the owner's time is unpaid, the margin is flattered by however much a replacement would cost.",
    "Leaving advertising out of operating expenses. It is usually one of the largest costs a store has.",
    "Confusing net profit with cash in the bank. A profitable business can run out of money by tying it up in stock.",
    "Comparing net margin across businesses with different structures — one that outsources fulfilment and one that owns a warehouse are not comparable on this line.",
  ],

  faqs: [
    {
      q: "What is the difference between gross and net profit?",
      a: "Gross profit subtracts only the cost of the goods sold. Net profit subtracts everything else too — salaries, rent, software, advertising, fulfilment and interest. Gross profit tells you whether the products work; net profit tells you whether the business does.",
    },
    {
      q: "Is this before or after tax?",
      a: "Before. The result is profit before income or corporation tax. Work with revenue figures that exclude sales tax and VAT so the two sides are consistent.",
    },
    {
      q: "Should the owner's salary be an expense?",
      a: "Yes, if you take one. If you do not, it is worth running the figure both ways so you know what the business would earn once someone has to be paid to do your job.",
    },
    {
      q: "Why is my net profit positive but my bank balance falling?",
      a: "Usually stock. Buying inventory converts cash into goods without reducing profit until those goods sell. Loan repayments and tax payments do the same thing. Profit and cash flow are different measurements and both need watching.",
    },
  ],

  relatedTools: ["gross-profit-calculator", "ecommerce-profit-calculator", "profit-margin-calculator"],
  relatedGuides: [],

  seo: {
    title: "Net Profit Calculator — Bottom-Line Profit and Margin",
    description:
      "Free net profit calculator. Enter revenue, cost of goods and expenses to get net profit and net margin, with gross profit alongside. Formula and example included.",
  },
};
