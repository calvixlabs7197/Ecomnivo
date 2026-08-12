import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf } from "@/lib/tools/math";

export type MarkupInput = {
  cost: number;
  sellingPrice: number;
  targetMarkup: number;
};

export const markupEngine: ToolEngine<MarkupInput> = {
  slug: "markup-calculator",

  fields: [
    {
      name: "cost",
      label: "Cost",
      kind: "currency",
      help: "What the item costs you.",
      min: 0,
      defaultValue: 50,
    },
    {
      name: "sellingPrice",
      label: "Selling price",
      kind: "currency",
      help: "What you sell it for.",
      min: 0,
      defaultValue: 75,
    },
    {
      name: "targetMarkup",
      label: "Target markup",
      kind: "percent",
      help: "Optional. See the price a different markup would produce.",
      min: 0,
      optional: true,
      defaultValue: 100,
    },
  ],

  compute: ({ cost, sellingPrice, targetMarkup }) => {
    const profit = sellingPrice - cost;
    const markup = percentOf(profit, cost);
    const margin = percentOf(profit, sellingPrice);
    const hasTarget = targetMarkup > 0 && cost > 0;
    const priceAtTarget = cost * (1 + targetMarkup / 100);

    return [
      {
        key: "markup",
        label: "Markup on cost",
        value: markup,
        format: "percent",
        emphasis: "primary",
        tone: markup === null ? "neutral" : markup > 0 ? "positive" : "negative",
        note:
          markup === null
            ? "Enter a cost above zero — markup is measured against what the item cost you."
            : undefined,
      },
      {
        key: "margin",
        label: "Profit margin",
        value: margin,
        format: "percent",
        emphasis: "secondary",
        note: "The same profit as a share of the selling price. Always the smaller number.",
      },
      {
        key: "profit",
        label: "Profit per unit",
        value: profit,
        format: "currency",
        tone: profit > 0 ? "positive" : profit < 0 ? "negative" : "neutral",
      },
      {
        key: "priceAtTarget",
        label: "Price at your target markup",
        value: onlyWhen(hasTarget, priceAtTarget),
        format: "currency",
        note: hasTarget ? undefined : "Add a target markup to see the price it produces.",
      },
    ];
  },
};
