import type { ToolEngine } from "@/lib/tools/types";
import { percentOf } from "@/lib/tools/math";

export type WholesalePriceInput = {
  unitCost: number;
  wholesaleMarkup: number;
  retailMarkup: number;
};

export const wholesalePriceEngine: ToolEngine<WholesalePriceInput> = {
  slug: "wholesale-price-calculator",

  fields: [
    {
      name: "unitCost",
      label: "Unit cost",
      kind: "currency",
      help: "What one unit costs you to make or buy.",
      min: 0,
      defaultValue: 10,
    },
    {
      name: "wholesaleMarkup",
      label: "Wholesale markup",
      kind: "percent",
      help: "What you add to your cost when selling to a retailer. 100 means double.",
      min: 0,
      defaultValue: 100,
    },
    {
      name: "retailMarkup",
      label: "Retailer's markup",
      kind: "percent",
      help: "What the retailer adds to your wholesale price. 150 means 2.5 times.",
      min: 0,
      defaultValue: 150,
    },
  ],

  compute: ({ unitCost, wholesaleMarkup, retailMarkup }) => {
    const wholesalePrice = unitCost * (1 + wholesaleMarkup / 100);
    const retailPrice = wholesalePrice * (1 + retailMarkup / 100);

    const wholesaleProfit = wholesalePrice - unitCost;
    const wholesaleMargin = percentOf(wholesaleProfit, wholesalePrice);
    const retailerMargin = percentOf(retailPrice - wholesalePrice, retailPrice);

    return [
      {
        key: "wholesalePrice",
        label: "Wholesale price",
        value: wholesalePrice,
        format: "currency",
        emphasis: "primary",
        note: "What you charge the retailer per unit.",
      },
      {
        key: "retailPrice",
        label: "Recommended retail price",
        value: retailPrice,
        format: "currency",
        emphasis: "primary",
        note: "What the retailer would need to charge at their markup.",
      },
      {
        key: "wholesaleMargin",
        label: "Your margin on wholesale",
        value: wholesaleMargin,
        format: "percent",
        tone: wholesaleMargin === null ? "neutral" : wholesaleMargin > 0 ? "positive" : "negative",
        note:
          wholesaleMargin === null
            ? "Enter a cost and markup that produce a wholesale price above zero."
            : undefined,
      },
      {
        key: "wholesaleProfit",
        label: "Your profit per unit",
        value: wholesaleProfit,
        format: "currency",
      },
      {
        key: "retailerMargin",
        label: "Retailer's margin",
        value: retailerMargin,
        format: "percent",
        note: "Retailers usually need this to be healthy before they will stock a product.",
      },
    ];
  },
};
