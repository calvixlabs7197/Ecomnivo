import type { ToolDefinition } from "@/lib/tools/types";
import type { ProductProfitInput } from "@/lib/tools/engines/product-profit-calculator";

export const productProfitContent: ToolDefinition<ProductProfitInput> = {
  slug: "product-profit-calculator",
  h1: "Product Profit Calculator",
  intro:
    "Work out what a single product earns you per unit, once its cost, shipping and fees are taken out. This is the figure to compare across a catalogue — it tells you which products are carrying the business and which are quietly costing you money.",

  formula: {
    expression:
      "Profit per unit = Price − (Unit cost + Shipping + Other fees)\n\nMargin = Profit per unit ÷ Price × 100",
    explanation:
      "Only per-unit costs belong here — those that occur every time you sell one more. Rent, salaries and subscriptions do not change with one extra sale, so including them would distort any comparison between products.",
  },

  example: {
    inputs: { price: 49.99, unitCost: 18, shippingCost: 4.5, otherFees: 1.75, unitsSold: 100 },
    narrative:
      "A product sells for 49.99. It costs 18.00 to buy, 4.50 to ship and pack, and 1.75 in payment fees — 24.25 in total. That leaves 25.74 per unit, a margin of 51.5%. Across 100 units, 2,574 of gross profit before any overheads.",
  },

  interpretation: [
    "This is contribution per unit, not net profit. It is what each sale contributes towards your fixed costs and profit.",
    "Rank products by this figure rather than by revenue. A high-priced item with thin margins can contribute less than a cheaper one that sells as well.",
    "Watch products where shipping is a large share of the cost. Heavy or bulky items often look profitable on price and are not once delivery is counted.",
    "If a product's per-unit profit is near zero, no amount of volume fixes it — you are buying revenue with your own money.",
  ],

  commonMistakes: [
    "Leaving out payment processing. It is small per unit and it applies to every single sale.",
    "Ignoring free shipping. If you absorb delivery, it is a real per-unit cost even though the customer never sees a charge.",
    "Forgetting returns. In categories where returns are common, the effective per-unit profit is well below this figure.",
    "Adding a share of rent or salaries. Those are fixed costs — including them here makes products look worse than they are and breaks comparisons between them.",
  ],

  faqs: [
    {
      q: "Should I include overheads in this calculation?",
      a: "No. This measures per-unit contribution, which is what each extra sale adds. Overheads do not change with one more order, so they belong in a full profit calculation rather than in a per-product one.",
    },
    {
      q: "How do I handle returns?",
      a: "Estimate your return rate for the product and reduce the effective price accordingly, or add the average cost of a return — return shipping plus any unsellable stock — to the other fees field.",
    },
    {
      q: "What counts as other fees?",
      a: "Anything charged per unit sold: payment processing, marketplace commission, per-item royalties or licensing, and pick-and-pack charges from a fulfilment provider.",
    },
    {
      q: "Why is my margin lower than I expected?",
      a: "Usually shipping and payment fees. They are individually small and easy to leave out of a mental calculation, and together they routinely account for ten to fifteen percent of the selling price.",
    },
  ],

  relatedTools: ["profit-margin-calculator", "selling-price-calculator", "ecommerce-profit-calculator"],
  relatedGuides: [],

  seo: {
    title: "Product Profit Calculator — Profit Per Unit",
    description:
      "Free product profit calculator. Work out profit and margin per unit after cost, shipping and fees, and scale it to total units. Formula and example included.",
  },
};
