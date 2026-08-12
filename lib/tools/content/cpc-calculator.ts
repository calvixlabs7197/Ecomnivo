import type { ToolDefinition } from "@/lib/tools/types";
import type { CpcInput } from "@/lib/tools/engines/cpc-calculator";

export const cpcContent: ToolDefinition<CpcInput> = {
  slug: "cpc-calculator",
  h1: "CPC Calculator",
  intro:
    "Cost per click is what you pay, on average, for one visit from a paid ad. Enter your spend and clicks to get it. Add your conversion rate and the calculator also works out what those clicks are costing you per order — the number that actually decides whether the traffic is worth buying.",

  formula: {
    expression: "CPC = Ad spend ÷ Clicks\n\nCPA = Ad spend ÷ (Clicks × Conversion rate)",
    explanation:
      "Divide what you spent by the clicks it bought. To go from cost per click to cost per order, divide the same spend by the number of clicks that actually convert — which is why a cheap click on a page that converts poorly can be more expensive than an expensive click on a page that converts well.",
  },

  example: {
    inputs: { adSpend: 500, clicks: 1250, conversionRate: 2 },
    narrative:
      "A campaign spends 500 and receives 1,250 clicks, so the cost per click is 500 ÷ 1,250 = 0.40. At a 2% conversion rate those clicks produce 25 orders, making the cost per acquisition 500 ÷ 25 = 20.00. Halving the click price to 0.20 would bring the cost per order to 10.00 — and so would doubling the conversion rate to 4%.",
  },

  interpretation: [
    "CPC on its own says nothing about whether a campaign works. It is only meaningful next to your conversion rate and your margin.",
    "Cheap clicks are not automatically good. Broad, low-intent placements often produce the lowest CPC and the worst conversion rate.",
    "Improving conversion rate lowers your cost per order exactly as much as negotiating the same proportional cut in click price — and it is usually more within your control.",
    "Compare your cost per acquisition against your gross profit per order. If CPA is higher than gross profit, the campaign loses money regardless of how attractive the CPC looks.",
  ],

  commonMistakes: [
    "Optimising for the lowest CPC. Bidding down until clicks are cheap usually buys worse traffic, and the cost per order goes up while the cost per click goes down.",
    "Using sessions instead of clicks. Not every click becomes a session — some visitors leave before the page loads — so the two figures differ and mixing them understates your true CPC.",
    "Confusing this cost per acquisition with customer acquisition cost. CPA counts ad spend against conversions; CAC counts all sales and marketing costs against genuinely new customers, and is always the larger number.",
    "Averaging CPC across campaigns with very different intent, which hides the fact that one of them is subsidising the other.",
  ],

  faqs: [
    {
      q: "What is a good cost per click?",
      a: "There is no good CPC in isolation. A 5.00 click is cheap if it converts at 10% on a high-margin product, and a 0.20 click is expensive if it never converts. Judge clicks by the cost per order they produce, compared with your gross profit per order.",
    },
    {
      q: "What is the difference between CPC and CPM?",
      a: "CPC is what you pay per click; CPM is what you pay per thousand impressions. Platforms usually charge on one basis and report both. CPM tells you the cost of reach, CPC the cost of a visit.",
    },
    {
      q: "Is CPA the same as CAC?",
      a: "No, though they are often used interchangeably. CPA divides ad spend by conversions, which includes orders from customers who had bought before. CAC divides total sales and marketing costs by new customers only, so it is a broader and higher figure.",
    },
    {
      q: "Why is my CPC rising over time?",
      a: "Usually auction competition, audience saturation, or declining ad relevance. A rising CPC is only a problem if your cost per order rises with it — if conversion rate improves at the same time, a higher click price can still be a better deal.",
    },
  ],

  relatedTools: ["roas-calculator", "break-even-roas-calculator", "ecommerce-profit-calculator"],
  relatedGuides: [],

  seo: {
    title: "CPC Calculator — Cost Per Click and Cost Per Order",
    description:
      "Free CPC calculator. Enter ad spend and clicks to get cost per click, plus cost per order when you add a conversion rate. Formula and example included.",
  },
};
