import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, safeDivide } from "@/lib/tools/math";

export type CpaInput = {
  adSpend: number;
  conversions: number;
  averageOrderValue: number;
};

export const cpaEngine: ToolEngine<CpaInput> = {
  slug: "cpa-calculator",

  fields: [
    {
      name: "adSpend",
      label: "Ad spend",
      kind: "currency",
      help: "Total spent over the period you are measuring.",
      min: 0,
      defaultValue: 500,
    },
    {
      name: "conversions",
      label: "Conversions",
      kind: "integer",
      help: "Orders, sign-ups or whatever you count as a conversion.",
      min: 0,
      defaultValue: 25,
    },
    {
      name: "averageOrderValue",
      label: "Average order value",
      kind: "currency",
      help: "Optional. Adding this also gives you ROAS and what each order leaves after its ad cost.",
      min: 0,
      optional: true,
      defaultValue: 80,
    },
  ],

  compute: ({ adSpend, conversions, averageOrderValue }) => {
    const cpa = safeDivide(adSpend, conversions);
    const hasValue = averageOrderValue > 0;
    const revenue = conversions * averageOrderValue;

    return [
      {
        key: "cpa",
        label: "Cost per acquisition",
        value: cpa,
        format: "currency",
        emphasis: "primary",
        note:
          cpa === null
            ? "Enter a conversion count above zero — with no conversions there is no cost per acquisition."
            : undefined,
      },
      {
        key: "roas",
        label: "ROAS",
        value: onlyWhen(hasValue, safeDivide(revenue, adSpend)),
        format: "ratio",
        emphasis: "secondary",
        note: hasValue ? undefined : "Add an average order value to see ROAS.",
      },
      {
        key: "valueAfterAdCost",
        label: "Order value left after ad cost",
        value: onlyWhen(hasValue && cpa !== null, averageOrderValue - (cpa ?? 0)),
        format: "currency",
        tone: hasValue && cpa !== null && averageOrderValue - cpa >= 0 ? "positive" : "negative",
        note: "Still before cost of goods — this is not profit per order.",
      },
    ];
  },
};
