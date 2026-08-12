import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, safeDivide } from "@/lib/tools/math";

export type LtvInput = {
  averageOrderValue: number;
  purchaseFrequency: number;
  lifespanYears: number;
  grossMargin: number;
  cac: number;
};

export const ltvEngine: ToolEngine<LtvInput> = {
  slug: "ltv-calculator",

  fields: [
    {
      name: "averageOrderValue",
      label: "Average order value",
      kind: "currency",
      help: "What a typical order is worth.",
      min: 0,
      defaultValue: 75,
    },
    {
      name: "purchaseFrequency",
      label: "Purchases per year",
      kind: "number",
      help: "How often a customer buys in a year. 3 means three orders a year.",
      min: 0,
      defaultValue: 3,
    },
    {
      name: "lifespanYears",
      label: "Customer lifespan (years)",
      kind: "number",
      help: "How long a customer keeps buying before they stop.",
      min: 0,
      defaultValue: 2,
    },
    {
      name: "grossMargin",
      label: "Gross margin",
      kind: "percent",
      help: "The share of each order you keep after cost of goods.",
      min: 0,
      max: 100,
      defaultValue: 45,
    },
    {
      name: "cac",
      label: "Customer acquisition cost",
      kind: "currency",
      help: "Optional. Adding CAC gives you the LTV to CAC ratio.",
      min: 0,
      optional: true,
      defaultValue: 50,
    },
  ],

  compute: ({ averageOrderValue, purchaseFrequency, lifespanYears, grossMargin, cac }) => {
    const ordersPerCustomer = purchaseFrequency * lifespanYears;
    const revenuePerCustomer = averageOrderValue * ordersPerCustomer;
    const ltv = revenuePerCustomer * (grossMargin / 100);

    const hasCac = cac > 0;
    const ratio = safeDivide(ltv, cac);

    return [
      {
        key: "ltv",
        label: "Customer lifetime value",
        value: ltv,
        format: "currency",
        emphasis: "primary",
        note: "Margin-adjusted: the profit a customer contributes, not the revenue they generate.",
      },
      {
        key: "ltvToCac",
        label: "LTV to CAC ratio",
        value: onlyWhen(hasCac, ratio),
        format: "ratio",
        emphasis: "secondary",
        tone: hasCac && ratio !== null ? (ratio >= 3 ? "positive" : "negative") : "neutral",
        note: hasCac
          ? "A widely used rule of thumb is 3.00x or better — a guideline, not a law."
          : "Add your acquisition cost to see the ratio.",
      },
      {
        key: "revenuePerCustomer",
        label: "Lifetime revenue per customer",
        value: revenuePerCustomer,
        format: "currency",
        note: "Before margin. This is the figure most LTV calculators stop at, and it flatters every business.",
      },
      {
        key: "ordersPerCustomer",
        label: "Orders per customer",
        value: ordersPerCustomer,
        format: "number",
      },
    ];
  },
};
