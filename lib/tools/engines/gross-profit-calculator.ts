import type { ToolEngine } from "@/lib/tools/types";
import { percentOf } from "@/lib/tools/math";

export type GrossProfitInput = {
  revenue: number;
  cogs: number;
};

export const grossProfitEngine: ToolEngine<GrossProfitInput> = {
  slug: "gross-profit-calculator",

  fields: [
    {
      name: "revenue",
      label: "Revenue",
      kind: "currency",
      help: "Total sales for the period, after discounts and returns.",
      min: 0,
      defaultValue: 100000,
    },
    {
      name: "cogs",
      label: "Cost of goods sold",
      kind: "currency",
      help: "Only the direct cost of the products sold — not rent, salaries or advertising.",
      min: 0,
      defaultValue: 62000,
    },
  ],

  compute: ({ revenue, cogs }) => {
    const grossProfit = revenue - cogs;
    const grossMargin = percentOf(grossProfit, revenue);
    const cogsShare = percentOf(cogs, revenue);

    return [
      {
        key: "grossProfit",
        label: "Gross profit",
        value: grossProfit,
        format: "currency",
        emphasis: "primary",
        tone: grossProfit > 0 ? "positive" : grossProfit < 0 ? "negative" : "neutral",
      },
      {
        key: "grossMargin",
        label: "Gross margin",
        value: grossMargin,
        format: "percent",
        emphasis: "secondary",
        tone: grossMargin === null ? "neutral" : grossMargin > 0 ? "positive" : "negative",
        note:
          grossMargin === null
            ? "Enter revenue above zero — margin is a share of revenue."
            : "The share of each sale left to cover everything else.",
      },
      {
        key: "cogsShare",
        label: "Cost of goods as a share of revenue",
        value: cogsShare,
        format: "percent",
      },
    ];
  },
};
