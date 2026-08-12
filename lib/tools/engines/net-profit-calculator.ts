import type { ToolEngine } from "@/lib/tools/types";
import { percentOf, sum } from "@/lib/tools/math";

export type NetProfitInput = {
  revenue: number;
  cogs: number;
  operatingExpenses: number;
  otherExpenses: number;
};

export const netProfitEngine: ToolEngine<NetProfitInput> = {
  slug: "net-profit-calculator",

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
      help: "The direct cost of the products sold.",
      min: 0,
      defaultValue: 62000,
    },
    {
      name: "operatingExpenses",
      label: "Operating expenses",
      kind: "currency",
      help: "Salaries, rent, software, advertising, fulfilment — the cost of running the business.",
      min: 0,
      defaultValue: 21000,
    },
    {
      name: "otherExpenses",
      label: "Other expenses",
      kind: "currency",
      help: "Optional. Interest, one-off costs, anything not covered above.",
      min: 0,
      optional: true,
      defaultValue: 5000,
    },
  ],

  compute: ({ revenue, cogs, operatingExpenses, otherExpenses }) => {
    const grossProfit = revenue - cogs;
    const totalExpenses = sum([cogs, operatingExpenses, otherExpenses]);
    const netProfit = revenue - totalExpenses;
    const netMargin = percentOf(netProfit, revenue);
    const grossMargin = percentOf(grossProfit, revenue);

    return [
      {
        key: "netProfit",
        label: "Net profit",
        value: netProfit,
        format: "currency",
        emphasis: "primary",
        tone: netProfit > 0 ? "positive" : netProfit < 0 ? "negative" : "neutral",
      },
      {
        key: "netMargin",
        label: "Net profit margin",
        value: netMargin,
        format: "percent",
        emphasis: "secondary",
        tone: netMargin === null ? "neutral" : netMargin > 0 ? "positive" : "negative",
        note:
          netMargin === null ? "Enter revenue above zero to see the margin." : undefined,
      },
      {
        key: "grossProfit",
        label: "Gross profit",
        value: grossProfit,
        format: "currency",
        note: "Revenue less cost of goods, before operating expenses.",
      },
      {
        key: "grossMargin",
        label: "Gross margin",
        value: grossMargin,
        format: "percent",
      },
      {
        key: "totalExpenses",
        label: "Total expenses",
        value: totalExpenses,
        format: "currency",
      },
    ];
  },
};
