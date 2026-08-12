import type { ToolDefinition } from "@/lib/tools/types";
import type { WholesalePriceInput } from "@/lib/tools/engines/wholesale-price-calculator";

export const wholesalePriceContent: ToolDefinition<WholesalePriceInput> = {
  slug: "wholesale-price-calculator",
  h1: "Wholesale Pricing Calculator",
  intro:
    "Selling through retailers means pricing twice: once for the retailer, and once for the shelf. This works out both from your unit cost, and shows the margin each side ends up with — the check that decides whether a retailer will actually stock you.",

  formula: {
    expression:
      "Wholesale price = Unit cost × (1 + Wholesale markup ÷ 100)\n\nRetail price = Wholesale price × (1 + Retailer's markup ÷ 100)",
    explanation:
      "Two markups applied in sequence. Yours turns cost into the wholesale price; the retailer's turns that into the shelf price. Both are markups on the price the seller paid, which is how the trade normally quotes them.",
  },

  example: {
    inputs: { unitCost: 10, wholesaleMarkup: 100, retailMarkup: 150 },
    narrative:
      "A product costs 10 to make. Doubling it — a 100% markup — gives a wholesale price of 20, leaving you a 50% margin. The retailer adds 150%, putting it on the shelf at 50 and giving them a 60% margin. If 50 is more than the market will bear, the problem is the 10 cost, not the markups.",
  },

  interpretation: [
    "Work back from the shelf price the market will accept, not forward from your cost. If the resulting retail price is uncompetitive, no markup arrangement fixes it.",
    "Retailers judge you on their margin. If the retail markup you assume is lower than they need, they will not stock the product at that wholesale price.",
    "Your wholesale margin has to cover everything the retailer does not — production, storage, sales effort and your own overheads.",
    "If you also sell direct at the recommended retail price, you make the full margin on those sales. Undercutting your own stockists, though, is the fastest way to lose them.",
  ],

  commonMistakes: [
    "Confusing markup with margin. A 100% markup is a 50% margin — quoting the wrong one to a retailer produces a very awkward conversation.",
    "Leaving production overheads, freight and duty out of the unit cost, so the wholesale margin is thinner than it looks.",
    "Assuming a retail markup without asking. Required margins vary widely by category and by retailer.",
    "Forgetting the costs that come with wholesale: samples, trade terms, longer payment periods and returns of unsold stock.",
  ],

  faqs: [
    {
      q: "What is a typical wholesale markup?",
      a: "Doubling the cost — a 100% markup, a 50% margin — is a common starting point, and retailers frequently apply a similar or larger markup on top. These are conventions rather than rules, and they vary a lot by category, volume and how much work each side does.",
    },
    {
      q: "What is the difference between wholesale price and RRP?",
      a: "The wholesale price is what the retailer pays you. The recommended retail price is what they charge the customer. The difference is the retailer's margin, which pays for their premises, staff and the risk of holding your stock.",
    },
    {
      q: "Can I sell direct at the same price as my retailers?",
      a: "Matching the recommended retail price is normal and keeps stockists comfortable. Undercutting them means competing with your own customers, and it is the most common reason a retailer drops a brand.",
    },
    {
      q: "Why does my wholesale margin look so much worse than my direct margin?",
      a: "Because the retailer is taking a share for work you would otherwise do — reaching the customer, holding stock, handling the sale. The trade-off is volume and reach without the cost of acquiring each customer yourself.",
    },
  ],

  relatedTools: ["markup-calculator", "selling-price-calculator", "product-profit-calculator"],
  relatedGuides: [],

  seo: {
    title: "Wholesale Pricing Calculator — Wholesale Price and RRP",
    description:
      "Free wholesale pricing calculator. Enter unit cost and two markups to get your wholesale price, the recommended retail price, and both margins.",
  },
};
