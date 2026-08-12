import type { ToolDefinition } from "@/lib/tools/types";
import type { ShopifyProfitInput } from "@/lib/tools/engines/shopify-profit-calculator";

export const shopifyProfitContent: ToolDefinition<ShopifyProfitInput> = {
  slug: "shopify-profit-calculator",
  h1: "Shopify Profit Calculator",
  intro:
    "Shopify's costs come in three shapes: a percentage of every sale, a flat fee on every order, and fixed monthly subscriptions. This works out what your store actually keeps once all three are taken out alongside your cost of goods.",

  formula: {
    expression:
      "Payment fees = (Rate × Revenue) + (Fixed fee × Orders)\n\nNet profit = Revenue − (Cost of goods + Payment fees + Plan + Apps + Shipping + Advertising)",
    explanation:
      "The per-order flat fee is what makes Shopify's effective cost higher than its headline rate, and the effect grows as average order value falls. On a 50 order a 0.30 fee is 0.6% of revenue; on a 15 order it is 2%.",
  },

  example: {
    inputs: {
      revenue: 10000,
      orders: 200,
      cogs: 4000,
      paymentRate: 2.9,
      paymentFixedFee: 0.3,
      planCost: 39,
      appCosts: 100,
      shipping: 0,
      adSpend: 0,
    },
    narrative:
      "A store does 10,000 across 200 orders. Payment fees are 2.9% of 10,000 (290) plus 0.30 on each of 200 orders (60) — 350 in total, an effective 3.5% rather than the headline 2.9%. Take off 4,000 of goods, a 39 plan and 100 of apps, and net profit is 5,511.",
  },

  interpretation: [
    "The effective payment rate is always higher than the advertised percentage, because of the flat per-order fee. Watch the 'fees as a share of revenue' figure rather than the headline rate.",
    "Low average order value is punished twice: the flat fee is a bigger share of each sale, and fixed monthly costs are spread over less revenue.",
    "App subscriptions are easy to accumulate and easy to forget. They are fixed costs, so they hurt most in a slow month.",
    "Moving up a Shopify plan lowers the transaction rate but raises the monthly fee. The break-even point is where the rate saving on your revenue exceeds the extra subscription.",
  ],

  commonMistakes: [
    "Using the headline payment rate and ignoring the per-transaction fee, which understates costs on every order.",
    "Forgetting app subscriptions entirely. A handful of apps can quietly cost more than the plan itself.",
    "Using the payment rate for a different country or card type. Rates vary, and international and premium cards usually cost more.",
    "Leaving out shipping you subsidised, and leaving out advertising, then wondering why the bank balance disagrees with the calculator.",
    "Counting stock purchased rather than stock sold in cost of goods.",
  ],

  faqs: [
    {
      q: "What rate should I enter for payment processing?",
      a: "Check your own Shopify billing rather than a published figure. Rates vary by plan, country, card type and whether you use Shopify Payments or a third-party gateway, and third-party gateways add a separate Shopify transaction fee on top.",
    },
    {
      q: "Why is my effective fee higher than the advertised rate?",
      a: "Because of the flat fee on each transaction. At 2.9% plus 0.30, a store averaging 50 per order pays about 3.5% effectively; one averaging 15 per order pays about 4.9%. The lower your order value, the bigger the gap.",
    },
    {
      q: "Does this include Shopify's extra fee for third-party gateways?",
      a: "Not as a separate line. If you use an external payment provider, add Shopify's additional transaction percentage to the payment rate field so the two are counted together.",
    },
    {
      q: "Is this profit before or after tax?",
      a: "Before. Work with figures excluding sales tax and VAT, and treat the result as profit before any income or corporation tax.",
    },
  ],

  relatedTools: ["ecommerce-profit-calculator", "product-profit-calculator", "profit-margin-calculator"],
  relatedGuides: [],

  seo: {
    title: "Shopify Profit Calculator — Fees, Apps and Margin",
    description:
      "Free Shopify profit calculator. Work out net profit after Shopify Payments fees, per-order charges, your plan and app costs. Formula and example included.",
  },
};
