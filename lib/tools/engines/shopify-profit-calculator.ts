import type { ToolEngine } from "@/lib/tools/types";
import { percentOf, sum } from "@/lib/tools/math";

export type ShopifyProfitInput = {
  revenue: number;
  orders: number;
  cogs: number;
  paymentRate: number;
  paymentFixedFee: number;
  planCost: number;
  appCosts: number;
  shipping: number;
  adSpend: number;
};

/**
 * Defaults reflect Shopify Payments' commonly published Basic-plan structure at
 * the time of writing (a percentage of revenue plus a flat fee per
 * transaction). Rates vary by plan, country and card type, so every one of
 * them is an editable field rather than a hardcoded assumption.
 */
export const shopifyProfitEngine: ToolEngine<ShopifyProfitInput> = {
  slug: "shopify-profit-calculator",

  fields: [
    {
      name: "revenue",
      label: "Revenue",
      kind: "currency",
      help: "Total sales for the period, after discounts and returns.",
      min: 0,
      defaultValue: 10000,
    },
    {
      name: "orders",
      label: "Orders",
      kind: "integer",
      help: "Used for the per-transaction fee.",
      min: 0,
      defaultValue: 200,
    },
    {
      name: "cogs",
      label: "Cost of goods sold",
      kind: "currency",
      help: "What the products you sold cost you.",
      min: 0,
      defaultValue: 4000,
    },
    {
      name: "paymentRate",
      label: "Payment processing rate",
      kind: "percent",
      help: "The percentage Shopify Payments takes. Check your plan — it varies by country and card.",
      min: 0,
      max: 100,
      defaultValue: 2.9,
    },
    {
      name: "paymentFixedFee",
      label: "Fixed fee per transaction",
      kind: "currency",
      help: "The flat amount charged on each order on top of the percentage.",
      min: 0,
      defaultValue: 0.3,
    },
    {
      name: "planCost",
      label: "Shopify plan cost",
      kind: "currency",
      help: "Your monthly subscription.",
      min: 0,
      defaultValue: 39,
    },
    {
      name: "appCosts",
      label: "App subscriptions",
      kind: "currency",
      help: "Everything you pay monthly for apps and themes.",
      min: 0,
      optional: true,
      defaultValue: 100,
    },
    {
      name: "shipping",
      label: "Shipping and fulfilment",
      kind: "currency",
      help: "Optional. Net of anything customers paid towards delivery.",
      min: 0,
      optional: true,
      defaultValue: 0,
    },
    {
      name: "adSpend",
      label: "Advertising",
      kind: "currency",
      help: "Optional. Everything spent acquiring these sales.",
      min: 0,
      optional: true,
      defaultValue: 0,
    },
  ],

  compute: ({
    revenue,
    orders,
    cogs,
    paymentRate,
    paymentFixedFee,
    planCost,
    appCosts,
    shipping,
    adSpend,
  }) => {
    const percentageFees = revenue * (paymentRate / 100);
    const fixedFees = orders * paymentFixedFee;
    const paymentFees = percentageFees + fixedFees;

    const totalCosts = sum([cogs, paymentFees, planCost, appCosts, shipping, adSpend]);
    const netProfit = revenue - totalCosts;
    const netMargin = percentOf(netProfit, revenue);
    const feesAsShare = percentOf(paymentFees, revenue);

    return [
      {
        key: "netProfit",
        label: "Net profit",
        value: netProfit,
        format: "currency",
        emphasis: "primary",
        tone: netProfit > 0 ? "positive" : netProfit < 0 ? "negative" : "neutral",
      },
      {
        key: "netMargin",
        label: "Net profit margin",
        value: netMargin,
        format: "percent",
        emphasis: "secondary",
        tone: netMargin === null ? "neutral" : netMargin > 0 ? "positive" : "negative",
        note:
          netMargin === null
            ? "Enter revenue above zero to see profit as a share of sales."
            : undefined,
      },
      {
        key: "paymentFees",
        label: "Shopify Payments fees",
        value: paymentFees,
        format: "currency",
        note: "The percentage of revenue plus the flat fee on every order.",
      },
      {
        key: "feesAsShare",
        label: "Payment fees as a share of revenue",
        value: feesAsShare,
        format: "percent",
        note: "Higher than the headline rate, because the flat per-order fee is included.",
      },
      {
        key: "totalCosts",
        label: "Total costs",
        value: totalCosts,
        format: "currency",
      },
    ];
  },
};
