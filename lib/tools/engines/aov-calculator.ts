import type { ToolEngine } from "@/lib/tools/types";
import { onlyWhen, safeDivide } from "@/lib/tools/math";

export type AovInput = {
  revenue: number;
  orders: number;
  targetAov: number;
};

export const aovEngine: ToolEngine<AovInput> = {
  slug: "aov-calculator",

  fields: [
    {
      name: "revenue",
      label: "Revenue",
      kind: "currency",
      help: "Total sales over the period, after discounts and returns.",
      min: 0,
      defaultValue: 45000,
    },
    {
      name: "orders",
      label: "Orders",
      kind: "integer",
      help: "How many orders produced that revenue.",
      min: 0,
      defaultValue: 600,
    },
    {
      name: "targetAov",
      label: "Target average order value",
      kind: "currency",
      help: "Optional. See what the same order count would be worth at a higher average.",
      min: 0,
      optional: true,
      defaultValue: 85,
    },
  ],

  compute: ({ revenue, orders, targetAov }) => {
    const aov = safeDivide(revenue, orders);
    const hasTarget = targetAov > 0 && orders > 0;
    const revenueAtTarget = orders * targetAov;

    return [
      {
        key: "aov",
        label: "Average order value",
        value: aov,
        format: "currency",
        emphasis: "primary",
        note:
          aov === null
            ? "Enter an order count above zero — the average is revenue divided by orders."
            : undefined,
      },
      {
        key: "revenueAtTarget",
        label: "Revenue at your target",
        value: onlyWhen(hasTarget, revenueAtTarget),
        format: "currency",
        emphasis: "secondary",
        note: hasTarget ? undefined : "Add a target to see what the same orders would be worth.",
      },
      {
        key: "additionalRevenue",
        label: "Additional revenue",
        value: onlyWhen(hasTarget, revenueAtTarget - revenue),
        format: "currency",
        tone: hasTarget && revenueAtTarget - revenue > 0 ? "positive" : "neutral",
        note: hasTarget
          ? "Earned from the same number of orders — no extra traffic required."
          : undefined,
      },
    ];
  },
};
