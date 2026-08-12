import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf } from "@/lib/tools/math";

export type CtrInput = {
  impressions: number;
  clicks: number;
  targetCtr: number;
};

export const ctrEngine: ToolEngine<CtrInput> = {
  slug: "ctr-calculator",

  fields: [
    {
      name: "impressions",
      label: "Impressions",
      kind: "integer",
      help: "How many times the ad or listing was shown.",
      min: 0,
      defaultValue: 100000,
    },
    {
      name: "clicks",
      label: "Clicks",
      kind: "integer",
      help: "How many of those impressions were clicked.",
      min: 0,
      defaultValue: 1250,
    },
    {
      name: "targetCtr",
      label: "Target click-through rate",
      kind: "percent",
      help: "Optional. See how many more clicks a higher rate would produce.",
      min: 0,
      max: 100,
      optional: true,
      defaultValue: 2,
    },
  ],

  compute: ({ impressions, clicks, targetCtr }) => {
    const ctr = percentOf(clicks, impressions);
    const hasTarget = targetCtr > 0 && impressions > 0;
    const clicksAtTarget = impressions * (targetCtr / 100);

    return [
      {
        key: "ctr",
        label: "Click-through rate",
        value: ctr,
        format: "percent",
        emphasis: "primary",
        note:
          ctr === null
            ? "Enter an impression count above zero — click-through rate is a share of impressions."
            : undefined,
      },
      {
        key: "clicksAtTarget",
        label: "Clicks at your target rate",
        value: onlyWhen(hasTarget, clicksAtTarget),
        format: "number",
        emphasis: "secondary",
        note: hasTarget ? undefined : "Add a target rate to see the clicks it would take.",
      },
      {
        key: "additionalClicks",
        label: "Additional clicks needed",
        value: onlyWhen(hasTarget, clicksAtTarget - clicks),
        format: "number",
        tone: hasTarget && clicksAtTarget - clicks > 0 ? "negative" : "positive",
        note: hasTarget
          ? "A negative figure means you are already ahead of your target."
          : undefined,
      },
    ];
  },
};
