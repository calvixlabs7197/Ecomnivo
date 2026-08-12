import type { ToolEngine } from "@/lib/tools/types";
import { percentOf } from "@/lib/tools/math";

export type ProfitMarginInput = {
  revenue: number;
  cost: number;
};

export const profitMarginEngine: ToolEngine<ProfitMarginInput> = {
  slug: "profit-margin-calculator",

  fields: [
    {
      name: "revenue",
      label: "Revenue (selling price)",
      kind: "currency",
      help: "What you sold it for. Works for a single unit or a whole period.",
      min: 0,
      defaultValue: 100,
    },
    {
      name: "cost",
      label: "Cost",
      kind: "currency",
      help: "What it cost you. Include every cost you want the margin to account for.",
      min: 0,
      defaultValue: 60,
    },
  ],

  compute: ({ revenue, cost }) => {
    const profit = revenue - cost;
    const margin = percentOf(profit, revenue);
    const markup = percentOf(profit, cost);

    return [
      {
        key: "margin",
        label: "Profit margin",
        value: margin,
        format: "percent",
        emphasis: "primary",
        tone: margin === null ? "neutral" : margin > 0 ? "positive" : "negative",
        note:
          margin === null
            ? "Enter a selling price above zero — margin is a share of revenue, so there has to be some."
            : undefined,
      },
      {
        key: "profit",
        label: "Profit",
        value: profit,
        format: "currency",
        emphasis: "secondary",
        tone: profit > 0 ? "positive" : profit < 0 ? "negative" : "neutral",
      },
      {
        key: "markup",
        label: "Markup on cost",
        value: markup,
        format: "percent",
        note:
          markup === null
            ? "Markup needs a cost above zero."
            : "The same profit expressed against cost instead of revenue — always the larger number.",
      },
    ];
  },
};
