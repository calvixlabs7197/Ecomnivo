import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, safeDivide, sum } from "@/lib/tools/math";

export type CacInput = {
  marketingCosts: number;
  salesCosts: number;
  newCustomers: number;
  customerLifetimeValue: number;
};

export const cacEngine: ToolEngine<CacInput> = {
  slug: "cac-calculator",

  fields: [
    {
      name: "marketingCosts",
      label: "Marketing costs",
      kind: "currency",
      help: "Ad spend, agencies, content, tools — everything spent attracting customers.",
      min: 0,
      defaultValue: 6000,
    },
    {
      name: "salesCosts",
      label: "Sales costs",
      kind: "currency",
      help: "Salaries, commission and software for anyone closing sales. Zero for most self-serve stores.",
      min: 0,
      optional: true,
      defaultValue: 4000,
    },
    {
      name: "newCustomers",
      label: "New customers acquired",
      kind: "integer",
      help: "First-time customers only. Repeat orders do not count here.",
      min: 0,
      defaultValue: 200,
    },
    {
      name: "customerLifetimeValue",
      label: "Customer lifetime value",
      kind: "currency",
      help: "Optional. Adding LTV gives you the LTV to CAC ratio.",
      min: 0,
      optional: true,
      defaultValue: 202.5,
    },
  ],

  compute: ({ marketingCosts, salesCosts, newCustomers, customerLifetimeValue }) => {
    const totalSpend = sum([marketingCosts, salesCosts]);
    const cac = safeDivide(totalSpend, newCustomers);
    const hasLtv = customerLifetimeValue > 0;
    const ratio = cac === null ? null : safeDivide(customerLifetimeValue, cac);

    return [
      {
        key: "cac",
        label: "Customer acquisition cost",
        value: cac,
        format: "currency",
        emphasis: "primary",
        note:
          cac === null
            ? "Enter a new-customer count above zero — CAC is a cost per customer acquired."
            : undefined,
      },
      {
        key: "ltvToCac",
        label: "LTV to CAC ratio",
        value: onlyWhen(hasLtv, ratio),
        format: "ratio",
        emphasis: "secondary",
        tone: hasLtv && ratio !== null ? (ratio >= 3 ? "positive" : "negative") : "neutral",
        note: hasLtv
          ? "A widely used rule of thumb is 3.00x or better, though it is a guideline rather than a law."
          : "Add a customer lifetime value to see the ratio.",
      },
      {
        key: "totalSpend",
        label: "Total sales and marketing spend",
        value: totalSpend,
        format: "currency",
      },
    ];
  },
};
