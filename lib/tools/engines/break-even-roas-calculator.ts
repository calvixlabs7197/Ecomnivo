import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf, safeDivide } from "@/lib/tools/math";

export type BreakEvenRoasInput = {
  price: number;
  cogs: number;
  variableCosts: number;
};

export const breakEvenRoasEngine: ToolEngine<BreakEvenRoasInput> = {
  slug: "break-even-roas-calculator",

  fields: [
    {
      name: "price",
      label: "Selling price",
      kind: "currency",
      help: "What the customer pays for one unit, excluding tax.",
      min: 0,
      defaultValue: 100,
    },
    {
      name: "cogs",
      label: "Cost of goods per unit",
      kind: "currency",
      help: "What the product costs you to buy or make — one unit.",
      min: 0,
      defaultValue: 55,
    },
    {
      name: "variableCosts",
      label: "Other variable costs per unit",
      kind: "currency",
      help: "Shipping, packaging and payment processing on that unit. Leave blank if none.",
      min: 0,
      optional: true,
      defaultValue: 5,
    },
  ],

  compute: ({ price, cogs, variableCosts }) => {
    const grossProfit = price - cogs - variableCosts;
    const grossMargin = percentOf(grossProfit, price);
    const isViable = grossProfit > 0 && price > 0;

    return [
      {
        key: "breakEvenRoas",
        label: "Break-even ROAS",
        value: onlyWhen(isViable, safeDivide(price, grossProfit)),
        format: "ratio",
        emphasis: "primary",
        note: isViable
          ? "Above this, advertising adds profit. Below it, every sale costs you money."
          : "These costs leave no gross profit at this price, so no level of ROAS breaks even. Reduce unit costs or raise the price.",
      },
      {
        key: "grossMargin",
        label: "Gross margin",
        value: grossMargin,
        format: "percent",
        emphasis: "secondary",
        tone: grossMargin !== null && grossMargin > 0 ? "positive" : "negative",
      },
      {
        key: "grossProfit",
        label: "Gross profit per unit",
        value: grossProfit,
        format: "currency",
        tone: grossProfit > 0 ? "positive" : "negative",
      },
    ];
  },
};
