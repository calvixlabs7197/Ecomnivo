import type { ToolDefinition } from "@/lib/tools/types";
import type { MarkupInput } from "@/lib/tools/engines/markup-calculator";

export const markupContent: ToolDefinition<MarkupInput> = {
  slug: "markup-calculator",
  h1: "Markup Calculator",
  intro:
    "Markup is how much you add to what something cost you. Enter your cost and selling price to see the markup, the margin those figures actually produce, and the price a different markup would give you.",

  formula: {
    expression:
      "Markup = (Price − Cost) ÷ Cost × 100\n\nPrice from markup = Cost × (1 + Markup ÷ 100)",
    explanation:
      "Markup measures profit against what you paid. Margin measures the same profit against what you charged. Because the price is always the larger of the two, markup is always the larger percentage — and the two diverge quickly as profitability rises.",
  },

  example: {
    inputs: { cost: 50, sellingPrice: 75, targetMarkup: 100 },
    narrative:
      "An item costs 50 and sells for 75. The 25 of profit is 50% of the cost, so that is a 50% markup — but only 33.3% of the 75 selling price, so the margin is 33.3%. Doubling the markup to 100% would put the price at 100.",
  },

  interpretation: [
    "Markup is a pricing instruction: it tells you what to charge. Margin is a performance measure: it tells you what you kept.",
    "A 100% markup is a 50% margin. A 50% markup is a 33.3% margin. The relationship is not intuitive, which is exactly why the mistake is so common.",
    "Markup has no upper limit; margin cannot reach 100%. If someone quotes a margin above 100%, they mean markup.",
    "Suppliers and wholesalers usually talk in markup, while accountants and boards talk in margin. Confirm which one is meant before agreeing to a number.",
  ],

  commonMistakes: [
    "Applying a markup when a margin was intended. Adding 40% to a 60 cost gives 84 and a 28.6% margin — not the 40% margin that was asked for.",
    "Dividing profit by price and calling it markup. That is the margin formula.",
    "Applying one markup across a whole catalogue when shipping and fee costs differ by product, so the real margin varies wildly.",
    "Marking up from a cost that excludes freight, duty and payment fees, so the resulting margin never materialises.",
  ],

  faqs: [
    {
      q: "What is the difference between markup and margin?",
      a: "Markup is profit as a percentage of cost; margin is profit as a percentage of the selling price. An item bought at 50 and sold at 75 carries a 50% markup and a 33.3% margin. Markup is always the higher figure.",
    },
    {
      q: "How do I convert markup to margin?",
      a: "Margin = markup ÷ (100 + markup) × 100. A 50% markup is 50 ÷ 150 = 33.3% margin. Going the other way, markup = margin ÷ (100 − margin) × 100.",
    },
    {
      q: "What markup should I use?",
      a: "Work backwards from the margin you need rather than picking a markup. Decide what share of each sale has to survive to cover overheads and profit, then convert that margin to the markup that produces it.",
    },
    {
      q: "Is a keystone markup still standard in retail?",
      a: "Keystone — doubling the cost, a 100% markup and a 50% margin — is a traditional retail starting point rather than a rule. Whether it works depends on your category, your costs and what the market will bear.",
    },
  ],

  relatedTools: ["selling-price-calculator", "profit-margin-calculator", "wholesale-price-calculator"],
  relatedGuides: [],

  seo: {
    title: "Markup Calculator — Markup, Margin and Price",
    description:
      "Free markup calculator. Enter cost and selling price to get markup percentage, the margin it produces, and the price at a target markup. Formula included.",
  },
};
