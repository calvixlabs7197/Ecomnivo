import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf, sum } from "@/lib/tools/math";

export type ProductProfitInput = {
  price: number;
  unitCost: number;
  shippingCost: number;
  otherFees: number;
  unitsSold: number;
};

export const productProfitEngine: ToolEngine<ProductProfitInput> = {
  slug: "product-profit-calculator",

  fields: [
    {
      name: "price",
      label: "Selling price",
      kind: "currency",
      help: "What one unit sells for, excluding tax.",
      min: 0,
      defaultValue: 49.99,
    },
    {
      name: "unitCost",
      label: "Unit cost",
      kind: "currency",
      help: "What one unit costs you to buy or make.",
      min: 0,
      defaultValue: 18,
    },
    {
      name: "shippingCost",
      label: "Shipping and packaging",
      kind: "currency",
      help: "Per unit, net of anything the customer pays towards it.",
      min: 0,
      optional: true,
      defaultValue: 4.5,
    },
    {
      name: "otherFees",
      label: "Other fees per unit",
      kind: "currency",
      help: "Payment processing, marketplace commission, per-unit royalties.",
      min: 0,
      optional: true,
      defaultValue: 1.75,
    },
    {
      name: "unitsSold",
      label: "Units sold",
      kind: "integer",
      help: "Optional. Scales the per-unit figures to a total.",
      min: 0,
      optional: true,
      defaultValue: 100,
    },
  ],

  compute: ({ price, unitCost, shippingCost, otherFees, unitsSold }) => {
    const costPerUnit = sum([unitCost, shippingCost, otherFees]);
    const profitPerUnit = price - costPerUnit;
    const margin = percentOf(profitPerUnit, price);
    const markup = percentOf(profitPerUnit, costPerUnit);
    const hasUnits = unitsSold > 0;

    return [
      {
        key: "profitPerUnit",
        label: "Profit per unit",
        value: profitPerUnit,
        format: "currency",
        emphasis: "primary",
        tone: profitPerUnit > 0 ? "positive" : profitPerUnit < 0 ? "negative" : "neutral",
      },
      {
        key: "margin",
        label: "Margin per unit",
        value: margin,
        format: "percent",
        emphasis: "secondary",
        tone: margin === null ? "neutral" : margin > 0 ? "positive" : "negative",
        note: margin === null ? "Enter a selling price above zero to see the margin." : undefined,
      },
      {
        key: "totalProfit",
        label: "Total profit",
        value: onlyWhen(hasUnits, profitPerUnit * unitsSold),
        format: "currency",
        tone: hasUnits && profitPerUnit > 0 ? "positive" : "neutral",
        note: hasUnits ? undefined : "Add a unit count to see the total.",
      },
      {
        key: "costPerUnit",
        label: "Total cost per unit",
        value: costPerUnit,
        format: "currency",
      },
      {
        key: "markup",
        label: "Markup on cost",
        value: markup,
        format: "percent",
        note: "Always higher than the margin — it divides the same profit by the smaller number.",
      },
    ];
  },
};
