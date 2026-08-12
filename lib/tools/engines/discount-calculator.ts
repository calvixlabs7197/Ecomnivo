import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf } from "@/lib/tools/math";

export type DiscountInput = {
  originalPrice: number;
  discountPercent: number;
  unitCost: number;
};

export const discountEngine: ToolEngine<DiscountInput> = {
  slug: "discount-calculator",

  fields: [
    {
      name: "originalPrice",
      label: "Original price",
      kind: "currency",
      help: "The price before the discount.",
      min: 0,
      defaultValue: 120,
    },
    {
      name: "discountPercent",
      label: "Discount",
      kind: "percent",
      help: "The percentage off. 25 means 25% off.",
      min: 0,
      max: 100,
      defaultValue: 25,
    },
    {
      name: "unitCost",
      label: "Unit cost",
      kind: "currency",
      help: "Optional. Add your cost to see what margin survives the discount.",
      min: 0,
      optional: true,
      defaultValue: 60,
    },
  ],

  compute: ({ originalPrice, discountPercent, unitCost }) => {
    const salePrice = originalPrice * (1 - discountPercent / 100);
    const saved = originalPrice - salePrice;
    const hasCost = unitCost > 0;

    const profitBefore = originalPrice - unitCost;
    const profitAfter = salePrice - unitCost;
    const marginAfter = percentOf(profitAfter, salePrice);
    const marginBefore = percentOf(profitBefore, originalPrice);

    return [
      {
        key: "salePrice",
        label: "Sale price",
        value: salePrice,
        format: "currency",
        emphasis: "primary",
      },
      {
        key: "saved",
        label: "Customer saves",
        value: saved,
        format: "currency",
        emphasis: "secondary",
      },
      {
        key: "marginAfter",
        label: "Margin after discount",
        value: onlyWhen(hasCost, marginAfter),
        format: "percent",
        tone: hasCost && marginAfter !== null && marginAfter > 0 ? "positive" : "negative",
        note: hasCost
          ? "What is left of each sale once the discount is applied."
          : "Add your unit cost to see what the discount does to your margin.",
      },
      {
        key: "profitAfter",
        label: "Profit per unit after discount",
        value: onlyWhen(hasCost, profitAfter),
        format: "currency",
        tone: hasCost && profitAfter > 0 ? "positive" : "negative",
      },
      {
        key: "marginBefore",
        label: "Margin before discount",
        value: onlyWhen(hasCost, marginBefore),
        format: "percent",
      },
    ];
  },
};
