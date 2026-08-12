import type { ToolEngine } from "@/lib/tools/types";
import { percentOf, sum } from "@/lib/tools/math";

export type EcommerceProfitInput = {
  revenue: number;
  cogs: number;
  shipping: number;
  transactionFees: number;
  adSpend: number;
  otherCosts: number;
};

export const ecommerceProfitEngine: ToolEngine<EcommerceProfitInput> = {
  slug: "ecommerce-profit-calculator",

  fields: [
    {
      name: "revenue",
      label: "Revenue",
      kind: "currency",
      help: "Total sales for the period, after discounts and returns.",
      min: 0,
      defaultValue: 10000,
    },
    {
      name: "cogs",
      label: "Cost of goods sold",
      kind: "currency",
      help: "What the products you sold cost you to buy or make.",
      min: 0,
      defaultValue: 4000,
    },
    {
      name: "shipping",
      label: "Shipping and fulfilment",
      kind: "currency",
      help: "Postage, packaging, pick and pack — net of anything customers paid towards it.",
      min: 0,
      defaultValue: 800,
    },
    {
      name: "transactionFees",
      label: "Transaction fees",
      kind: "currency",
      help: "Payment processing and marketplace commission.",
      min: 0,
      defaultValue: 300,
    },
    {
      name: "adSpend",
      label: "Advertising",
      kind: "currency",
      help: "Everything you spent acquiring these sales.",
      min: 0,
      defaultValue: 2000,
    },
    {
      name: "otherCosts",
      label: "Other costs",
      kind: "currency",
      help: "Optional. Software, apps, contractors, and anything else not covered above.",
      min: 0,
      optional: true,
      defaultValue: 500,
    },
  ],

  compute: ({ revenue, cogs, shipping, transactionFees, adSpend, otherCosts }) => {
    const totalCosts = sum([cogs, shipping, transactionFees, adSpend, otherCosts]);
    const netProfit = revenue - totalCosts;
    const netMargin = percentOf(netProfit, revenue);
    const grossProfit = revenue - cogs;

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
          netMargin === null
            ? "Enter revenue above zero to see profit as a share of sales."
            : undefined,
      },
      {
        key: "grossProfit",
        label: "Gross profit",
        value: grossProfit,
        format: "currency",
        note: "Revenue less cost of goods only — before shipping, fees and advertising.",
      },
      {
        key: "totalCosts",
        label: "Total costs",
        value: totalCosts,
        format: "currency",
      },
    ];
  },
};
