import type { ToolDefinition } from "@/lib/tools/types";
import type { DiscountInput } from "@/lib/tools/engines/discount-calculator";

export const discountContent: ToolDefinition<DiscountInput> = {
  slug: "discount-calculator",
  h1: "Discount Calculator",
  intro:
    "Work out a sale price and what the customer saves — and, more usefully, what the discount does to your margin. A discount comes entirely out of profit, so a modest-looking percentage off the price can be a very large percentage off what you keep.",

  formula: {
    expression:
      "Sale price = Original price × (1 − Discount ÷ 100)\n\nMargin after discount = (Sale price − Cost) ÷ Sale price × 100",
    explanation:
      "The discount reduces the price, but your cost does not move. All of the reduction comes out of the profit, which is why the percentage lost from margin is always larger than the percentage taken off the price.",
  },

  example: {
    inputs: { originalPrice: 120, discountPercent: 25, unitCost: 60 },
    narrative:
      "An item priced at 120 with a 25% discount sells for 90, saving the customer 30. At a cost of 60, the margin falls from 50% to 33.3% — and the profit per unit from 60 to 30. A 25% discount halved the profit.",
  },

  interpretation: [
    "Discounts come out of profit, not revenue. On a 50% margin, a 25% discount removes half your profit per unit.",
    "To stand still on total profit, the volume increase has to make up the profit given away — usually a much bigger increase than people expect.",
    "Check the margin after discount before running a promotion. If it approaches zero, you are paying customers to take stock.",
    "Frequent discounting trains customers to wait, which lowers the effective margin on full-price sales too.",
  ],

  commonMistakes: [
    "Judging a discount by the percentage off the price rather than by its effect on margin, which is always larger.",
    "Stacking discounts. A 20% code on an item already reduced by 20% is a 36% reduction, not 40%, and it is easy to lose track of what is left.",
    "Forgetting that shipping, payment fees and returns still apply at the discounted price, so the real remaining margin is thinner than this figure.",
    "Discounting the products you can least afford to. Thin-margin items are the worst candidates, and often the first ones chosen.",
  ],

  faqs: [
    {
      q: "How much extra volume does a discount need to break even?",
      a: "Compare profit per unit before and after. If a 25% discount cuts profit per unit from 60 to 30, you need to sell twice as many units to make the same total profit. The thinner the starting margin, the more punishing the requirement.",
    },
    {
      q: "How do I work out the discount from an original and sale price?",
      a: "Discount = (Original − Sale) ÷ Original × 100. From 120 down to 90: 30 ÷ 120 = 25%.",
    },
    {
      q: "How do stacked discounts work?",
      a: "They multiply rather than add. Two 20% discounts leave 0.8 × 0.8 = 0.64 of the price, a 36% total reduction rather than 40%.",
    },
    {
      q: "Should the discount be calculated before or after tax?",
      a: "Work in figures excluding sales tax and VAT, as this calculator does. Applying a discount to a tax-inclusive price and comparing it against a tax-exclusive cost will overstate your margin.",
    },
  ],

  relatedTools: ["profit-margin-calculator", "selling-price-calculator", "markup-calculator"],
  relatedGuides: [],

  seo: {
    title: "Discount Calculator — Sale Price and Margin Impact",
    description:
      "Free discount calculator. Get the sale price, the amount saved, and what the discount does to your profit margin. Formula and worked example included.",
  },
};
