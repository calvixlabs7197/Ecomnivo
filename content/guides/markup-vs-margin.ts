import type { GuideDoc } from "@/lib/content/types";

export const markupVsMargin: GuideDoc = {
  slug: "markup-vs-margin",
  title: "Markup vs Margin: The Difference That Quietly Costs You Money",
  excerpt:
    "Markup and margin measure the same profit against different numbers. Confusing them is the most common pricing error in e-commerce, and it always costs you rather than the customer.",
  category: "Pricing",
  tags: ["pricing", "margin", "markup"],
  author: { name: "EcomNivo" },
  publishedAt: "2026-08-12",
  updatedAt: "2026-08-12",
  isIndexable: true,
  relatedTools: [
    "markup-calculator",
    "selling-price-calculator",
    "profit-margin-calculator",
    "product-profit-calculator",
  ],
  seoTitle: "Markup vs Margin — What's the Difference?",
  seoDescription:
    "Markup and margin measure the same profit against different numbers. Learn the difference, how to convert between them, and why mixing them up costs you money.",
  contentMd: `Two people can look at the same product, agree on the same profit, and quote you completely different percentages. Neither is lying. One is talking about markup and the other about margin.

Getting these two confused is the most common pricing mistake in e-commerce. It is also one of the most expensive, because the error only ever runs in one direction: you end up charging less than you meant to.

## The same profit, two denominators

Both start from identical arithmetic. You buy something for 60 and sell it for 100, so you make 40.

The question is what you divide that 40 by.

- **Margin** divides it by the **selling price**: 40 ÷ 100 = **40%**
- **Markup** divides it by the **cost**: 40 ÷ 60 = **66.7%**

Same product. Same 40 of profit. One number is nearly two-thirds larger than the other, purely because of which figure sat under the line.

Because the selling price is always bigger than the cost, **margin is always the smaller percentage**. That is not a rule of thumb; it falls directly out of the arithmetic, and it holds for every product that makes money.

## Where the money leaks

Here is the mistake, in the form it usually takes.

You want a 40% margin. Your product costs 50. So you add 40% to the cost:

\`\`\`
50 × 1.40 = 70
\`\`\`

That feels right. It is not. Check what margin 70 actually delivers:

\`\`\`
(70 − 50) ÷ 70 = 28.6%
\`\`\`

You wanted 40% and you built a business on 28.6%. The correct price is:

\`\`\`
50 ÷ (1 − 0.40) = 50 ÷ 0.60 = 83.33
\`\`\`

That is **13.33 per unit** — the difference between the price you set and the price you needed. On a thousand units a month, it is 13,330 of profit that quietly never existed.

The gap widens as your target margin rises. At a 20% target the error costs you a little. At a 60% target, the cost-plus answer is 80 and the correct answer is 125.

| Target margin | Cost-plus (wrong) | Correct price | Margin you actually got |
|---|---|---|---|
| 20% | 60.00 | 62.50 | 16.7% |
| 40% | 70.00 | 83.33 | 28.6% |
| 60% | 80.00 | 125.00 | 37.5% |

*Based on a unit cost of 50.*

Note the last column. Every time, the margin you achieve is meaningfully below the one you asked for — and the more ambitious your target, the further short you land.

## Converting between them

You will need both, because suppliers and wholesalers usually talk in markup while accountants and investors talk in margin.

**Markup to margin:**

\`\`\`
Margin = Markup ÷ (100 + Markup) × 100
\`\`\`

A 50% markup is 50 ÷ 150 = 33.3% margin.

**Margin to markup:**

\`\`\`
Markup = Margin ÷ (100 − Margin) × 100
\`\`\`

A 40% margin is 40 ÷ 60 = 66.7% markup.

A few pairs worth committing to memory, because they come up constantly:

| Markup | Margin |
|---|---|
| 25% | 20% |
| 50% | 33.3% |
| 100% | 50% |
| 150% | 60% |
| 233% | 70% |

The one at the middle of that table is worth knowing on its own. **Doubling your cost is a 100% markup and a 50% margin** — the traditional "keystone" price in retail. If someone tells you they double their cost and make "100% margin", they have made this mistake.

## Which one should you actually use?

Use whichever answers the question in front of you.

**Margin** answers *how much of each sale do I keep?* It is the right measure for judging the health of a product or a business, because it is a share of revenue and it compares cleanly across products at different price points. It is also the figure your break-even ROAS depends on.

**Markup** answers *how much did I add to my cost?* It is the right instruction for setting a price, and it is the language most supply chains use.

The practical approach: decide the **margin** you need, then convert it to the **markup** that produces it, and price from that.

## One more trap: which costs go in

Whichever measure you use, the answer is only as good as the cost you feed it.

A price built on the supplier invoice alone will not deliver the margin you calculated, because the invoice is not the whole cost. Before you set a price, add:

- inbound freight and import duty
- payment processing, typically 2–3% plus a flat fee per order
- outbound shipping and packaging, including any delivery you subsidise
- marketplace or platform commission
- an allowance for returns, which matters enormously in some categories

It is entirely normal for those to add ten to fifteen percent of the selling price. A product priced for a 40% margin on the invoice cost alone can easily deliver 25% in practice — which is roughly the size of the error we started with, arrived at by a completely different route.

## The short version

- Margin divides profit by the **price**. Markup divides it by the **cost**.
- Margin is always the smaller number, and it can never reach 100%.
- To hit a target margin, **divide** the cost by (1 − margin). Do not multiply.
- Include every per-unit cost before you calculate either one.

If you would rather not do the arithmetic by hand, the [Markup Calculator](/tools/markup-calculator) shows both figures side by side from a cost and a price, and the [Selling Price Calculator](/tools/selling-price-calculator) works backwards from the margin you want to the price that delivers it.`,
};
