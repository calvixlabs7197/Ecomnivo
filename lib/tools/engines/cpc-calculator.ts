import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, safeDivide } from "@/lib/tools/math";

export type CpcInput = {
  adSpend: number;
  clicks: number;
  conversionRate: number;
};

export const cpcEngine: ToolEngine<CpcInput> = {
  slug: "cpc-calculator",

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
      name: "clicks",
      label: "Clicks",
      kind: "integer",
      help: "Clicks recorded over the same period.",
      min: 0,
      defaultValue: 1250,
    },
    {
      name: "conversionRate",
      label: "Conversion rate",
      kind: "percent",
      help: "Optional. The share of clicks that become orders — 2 means 2%.",
      min: 0,
      max: 100,
      optional: true,
      defaultValue: 2,
    },
  ],

  compute: ({ adSpend, clicks, conversionRate }) => {
    const cpc = safeDivide(adSpend, clicks);
    const conversions = clicks * (conversionRate / 100);
    const hasConversionRate = conversionRate > 0;

    return [
      {
        key: "cpc",
        label: "Cost per click",
        value: cpc,
        format: "currency",
        emphasis: "primary",
        note:
          cpc === null
            ? "Enter a click count above zero — with no clicks there is no cost per click to work out."
            : undefined,
      },
      {
        key: "cpa",
        label: "Cost per acquisition",
        value: onlyWhen(hasConversionRate, safeDivide(adSpend, conversions)),
        format: "currency",
        emphasis: "secondary",
        note: hasConversionRate
          ? "What each order costs you in ad spend at this conversion rate."
          : "Add a conversion rate to see what each order costs.",
      },
      {
        key: "conversions",
        label: "Expected orders",
        value: onlyWhen(hasConversionRate, conversions),
        format: "number",
      },
    ];
  },
};
