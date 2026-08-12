import type { ToolEngine } from "@/lib/tools/types";
import { safeDivide } from "@/lib/tools/math";

export type AdBudgetInput = {
  revenueGoal: number;
  targetRoas: number;
  days: number;
};

export const adBudgetEngine: ToolEngine<AdBudgetInput> = {
  slug: "ad-budget-calculator",

  fields: [
    {
      name: "revenueGoal",
      label: "Revenue goal",
      kind: "currency",
      help: "The revenue you want advertising to generate over the period.",
      min: 0,
      defaultValue: 50000,
    },
    {
      name: "targetRoas",
      label: "Target ROAS",
      kind: "number",
      help: "The return you realistically expect. 4 means 4 in revenue for every 1 spent.",
      min: 0,
      defaultValue: 4,
    },
    {
      name: "days",
      label: "Over how many days",
      kind: "integer",
      help: "Used to work out the daily budget.",
      min: 1,
      defaultValue: 30,
    },
  ],

  compute: ({ revenueGoal, targetRoas, days }) => {
    const totalBudget = safeDivide(revenueGoal, targetRoas);
    const dailyBudget = totalBudget === null ? null : safeDivide(totalBudget, days);
    const dailyRevenue = safeDivide(revenueGoal, days);

    return [
      {
        key: "totalBudget",
        label: "Total ad budget",
        value: totalBudget,
        format: "currency",
        emphasis: "primary",
        note:
          totalBudget === null
            ? "Enter a target ROAS above zero — the budget is the revenue goal divided by it."
            : "What you need to spend to hit the goal at this ROAS.",
      },
      {
        key: "dailyBudget",
        label: "Daily budget",
        value: dailyBudget,
        format: "currency",
        emphasis: "secondary",
      },
      {
        key: "dailyRevenue",
        label: "Revenue needed per day",
        value: dailyRevenue,
        format: "currency",
      },
    ];
  },
};
