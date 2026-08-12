import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, percentOf } from "@/lib/tools/math";

export type ConversionRateInput = {
  sessions: number;
  conversions: number;
  targetRate: number;
};

export const conversionRateEngine: ToolEngine<ConversionRateInput> = {
  slug: "conversion-rate-calculator",

  fields: [
    {
      name: "sessions",
      label: "Sessions",
      kind: "integer",
      help: "Visits over the period. Use sessions, not users, and keep it consistent.",
      min: 0,
      defaultValue: 25000,
    },
    {
      name: "conversions",
      label: "Conversions",
      kind: "integer",
      help: "Orders, or whatever you count as a conversion, over the same period.",
      min: 0,
      defaultValue: 450,
    },
    {
      name: "targetRate",
      label: "Target conversion rate",
      kind: "percent",
      help: "Optional. See how many extra orders a higher rate would produce.",
      min: 0,
      max: 100,
      optional: true,
      defaultValue: 2.5,
    },
  ],

  compute: ({ sessions, conversions, targetRate }) => {
    const rate = percentOf(conversions, sessions);
    const hasTarget = targetRate > 0 && sessions > 0;
    const conversionsAtTarget = sessions * (targetRate / 100);

    return [
      {
        key: "conversionRate",
        label: "Conversion rate",
        value: rate,
        format: "percent",
        emphasis: "primary",
        note:
          rate === null
            ? "Enter a session count above zero — conversion rate is a share of sessions."
            : undefined,
      },
      {
        key: "conversionsAtTarget",
        label: "Orders at your target rate",
        value: onlyWhen(hasTarget, conversionsAtTarget),
        format: "number",
        emphasis: "secondary",
        note: hasTarget ? undefined : "Add a target rate to see what it would produce.",
      },
      {
        key: "additionalConversions",
        label: "Additional orders",
        value: onlyWhen(hasTarget, conversionsAtTarget - conversions),
        format: "number",
        tone: hasTarget && conversionsAtTarget - conversions > 0 ? "positive" : "neutral",
        note: hasTarget
          ? "What reaching the target would add, at the same traffic."
          : undefined,
      },
    ];
  },
};
