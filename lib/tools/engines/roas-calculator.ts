import type { ToolEngine } from "@/lib/tools/types";
import { safeDivide } from "@/lib/tools/math";

/** Type alias, not an interface — only aliases satisfy the Record<string, number> constraint. */
export type RoasInput = {
  revenue: number;
  adSpend: number;
};

export const roasEngine: ToolEngine<RoasInput> = {
  slug: "roas-calculator",

  fields: [
    {
      name: "revenue",
      label: "Revenue from ads",
      kind: "currency",
      help: "Revenue attributed to the campaign you are measuring, over the same period as the spend.",
      min: 0,
      defaultValue: 8000,
    },
    {
      name: "adSpend",
      label: "Ad spend",
      kind: "currency",
      help: "What you paid the ad platform over that period.",
      min: 0,
      defaultValue: 2000,
    },
  ],

  compute: ({ revenue, adSpend }) => {
    const roas = safeDivide(revenue, adSpend);
    const revenueAfterAdSpend = revenue - adSpend;

    return [
      {
        key: "roas",
        label: "ROAS",
        value: roas,
        format: "ratio",
        emphasis: "primary",
        note:
          roas === null
            ? "Enter an ad spend above zero — with nothing spent there is no return to measure."
            : undefined,
      },
      {
        key: "roasPercent",
        label: "ROAS as a percentage",
        value: roas === null ? null : roas * 100,
        format: "percent",
        emphasis: "secondary",
      },
      {
        key: "revenueAfterAdSpend",
        label: "Revenue left after ad spend",
        value: revenueAfterAdSpend,
        format: "currency",
        tone: revenueAfterAdSpend >= 0 ? "positive" : "negative",
        note: "This is revenue, not profit — product and fulfilment costs still come out of it.",
      },
    ];
  },
};
