import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf, safeDivide } from "@/lib/tools/math";

export type CpmInput = {
  adSpend: number;
  impressions: number;
  clicks: number;
};

export const cpmEngine: ToolEngine<CpmInput> = {
  slug: "cpm-calculator",

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
      name: "impressions",
      label: "Impressions",
      kind: "integer",
      help: "How many times the ad was served over that period.",
      min: 0,
      defaultValue: 100000,
    },
    {
      name: "clicks",
      label: "Clicks",
      kind: "integer",
      help: "Optional. Adding clicks also gives you click-through rate and cost per click.",
      min: 0,
      optional: true,
      defaultValue: 1250,
    },
  ],

  compute: ({ adSpend, impressions, clicks }) => {
    const costPerImpression = safeDivide(adSpend, impressions);
    const cpm = costPerImpression === null ? null : costPerImpression * 1000;
    const hasClicks = clicks > 0;

    return [
      {
        key: "cpm",
        label: "CPM",
        value: cpm,
        format: "currency",
        emphasis: "primary",
        note:
          cpm === null
            ? "Enter an impression count above zero — CPM is a cost per thousand impressions."
            : "What you pay for a thousand impressions.",
      },
      {
        key: "ctr",
        label: "Click-through rate",
        value: onlyWhen(hasClicks, percentOf(clicks, impressions)),
        format: "percent",
        emphasis: "secondary",
        note: hasClicks ? undefined : "Add a click count to see click-through rate.",
      },
      {
        key: "cpc",
        label: "Cost per click",
        value: onlyWhen(hasClicks, safeDivide(adSpend, clicks)),
        format: "currency",
      },
    ];
  },
};
