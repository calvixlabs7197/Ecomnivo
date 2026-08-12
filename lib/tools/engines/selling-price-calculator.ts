import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf, safeDivide, sum } from "@/lib/tools/math";

export type SellingPriceInput = {
  cost: number;
  additionalCosts: number;
  targetMargin: number;
};

export const sellingPriceEngine: ToolEngine<SellingPriceInput> = {
  slug: "selling-price-calculator",

  fields: [
    {
      name: "cost",
      label: "Unit cost",
      kind: "currency",
      help: "What the product costs you to buy or make.",
      min: 0,
      defaultValue: 50,
    },
    {
      name: "additionalCosts",
      label: "Additional costs per unit",
      kind: "currency",
      help: "Optional. Shipping, packaging and fees you want the price to cover.",
      min: 0,
      optional: true,
      defaultValue: 0,
    },
    {
      name: "targetMargin",
      label: "Target profit margin",
      kind: "percent",
      help: "The share of the selling price you want to keep. Must be under 100%.",
      min: 0,
      max: 99.99,
      defaultValue: 40,
    },
  ],

  compute: ({ cost, additionalCosts, targetMargin }) => {
    const totalCost = sum([cost, additionalCosts]);

    // Price = Cost / (1 - margin). A margin of 100% or more is unreachable:
    // it would require the cost to be zero, and the division would blow up.
    const marginAsDecimal = targetMargin / 100;
    const isReachable = marginAsDecimal < 1;
    const sellingPrice = onlyWhen(isReachable, safeDivide(totalCost, 1 - marginAsDecimal));
    const profit = sellingPrice === null ? null : sellingPrice - totalCost;
    const markup = profit === null ? null : percentOf(profit, totalCost);

    return [
      {
        key: "sellingPrice",
        label: "Selling price",
        value: sellingPrice,
        format: "currency",
        emphasis: "primary",
        note: isReachable
          ? "The price that leaves your target margin after costs."
          : "A margin of 100% or more is impossible — it would require the product to cost you nothing.",
      },
      {
        key: "profit",
        label: "Profit per unit",
        value: profit,
        format: "currency",
        emphasis: "secondary",
        tone: profit !== null && profit > 0 ? "positive" : "neutral",
      },
      {
        key: "markup",
        label: "Equivalent markup",
        value: markup,
        format: "percent",
        note: "The same price expressed as a markup on cost — what you would type into a system that works in markups.",
      },
      {
        key: "totalCost",
        label: "Total cost per unit",
        value: totalCost,
        format: "currency",
      },
    ];
  },
};
