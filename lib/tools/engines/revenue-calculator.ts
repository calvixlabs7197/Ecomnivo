import type { ToolEngine } from "@/lib/tools/types";
import { safeDivide } from "@/lib/tools/math";

export type RevenueInput = {
  sessions: number;
  conversionRate: number;
  averageOrderValue: number;
};

export const revenueEngine: ToolEngine<RevenueInput> = {
  slug: "revenue-calculator",

  fields: [
    {
      name: "sessions",
      label: "Sessions",
      kind: "integer",
      help: "Visits over the period you are projecting.",
      min: 0,
      defaultValue: 25000,
    },
    {
      name: "conversionRate",
      label: "Conversion rate",
      kind: "percent",
      help: "The share of sessions that become orders. 1.8 means 1.8%.",
      min: 0,
      max: 100,
      defaultValue: 1.8,
    },
    {
      name: "averageOrderValue",
      label: "Average order value",
      kind: "currency",
      help: "What a typical order is worth.",
      min: 0,
      defaultValue: 75,
    },
  ],

  compute: ({ sessions, conversionRate, averageOrderValue }) => {
    const orders = sessions * (conversionRate / 100);
    const revenue = orders * averageOrderValue;

    return [
      {
        key: "revenue",
        label: "Projected revenue",
        value: revenue,
        format: "currency",
        emphasis: "primary",
      },
      {
        key: "orders",
        label: "Orders",
        value: orders,
        format: "number",
        emphasis: "secondary",
      },
      {
        key: "revenuePerSession",
        label: "Revenue per session",
        value: safeDivide(revenue, sessions),
        format: "currency",
        note: "Useful as a ceiling on what a visit is worth buying for.",
      },
    ];
  },
};
