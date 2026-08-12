import type { GuideDoc } from "@/lib/content/types";

export const breakEvenRoasExplained: GuideDoc = {
  slug: "break-even-roas-explained",
  title: "Break-Even ROAS: The Only Ad Benchmark That Applies to You",
  excerpt:
    "A 'good' ROAS is not 3, or 4, or whatever a case study quoted. It is a number your own gross margin sets, and you can work it out in about a minute.",
  category: "Advertising",
  tags: ["advertising", "roas", "margin"],
  author: { name: "EcomNivo" },
  publishedAt: "2026-08-12",
  updatedAt: "2026-08-12",
  isIndexable: true,
  relatedTools: [
    "break-even-roas-calculator",
    "roas-calculator",
    "profit-margin-calculator",
    "ad-budget-calculator",
  ],
  seoTitle: "Break-Even ROAS Explained — Find Your Real Target",
  seoDescription:
    "Your break-even ROAS is set by your gross margin, not by an industry benchmark. Here is how to calculate it, and why a 4x ROAS can still lose money.",
  contentMd: `Ask what a good ROAS is and you will get a number. Three. Four. Whatever the last case study said.

Every one of those answers is useless, because a good ROAS is not a property of advertising. It is a property of **your margin**. Two stores running identical campaigns at an identical 3.00× return can be having completely different months — one comfortably profitable, the other quietly losing money on every order.

## The one calculation that matters

Break-even ROAS is the return at which advertising exactly pays for itself: revenue covers the goods, the cost of delivering them, and the ad spend, with nothing over.

\`\`\`
Break-even ROAS = 1 ÷ Gross margin
\`\`\`

That is the whole thing. If 40% of each sale survives as gross profit, you need to generate 1 ÷ 0.40 = **2.50** in revenue for every 1 spent just to stand still.

Work it from your own figures:

1. Take your selling price.
2. Subtract the cost of goods.
3. Subtract the variable costs of delivering it — shipping, packaging, payment processing.
4. Divide what is left by the selling price. That is your gross margin.
5. Divide 1 by that margin.

A worked example. A product sells for 100, costs 55 to buy, and another 5 goes on shipping, packaging and card fees:

\`\`\`
Gross profit  = 100 − 55 − 5 = 40
Gross margin  = 40 ÷ 100     = 40%
Break-even    = 1 ÷ 0.40     = 2.50×
\`\`\`

Below 2.50×, every order costs you money. Above it, advertising starts contributing.

## Why this is so unforgiving at low margins

The relationship is not linear, and that surprises people.

| Gross margin | Break-even ROAS |
|---|---|
| 70% | 1.43× |
| 60% | 1.67× |
| 50% | 2.00× |
| 40% | 2.50× |
| 30% | 3.33× |
| 20% | 5.00× |
| 10% | 10.00× |

Halving your margin from 40% to 20% does not double the difficulty of advertising — it takes the bar from 2.50× to 5.00×, into territory most paid social campaigns simply do not reach at scale.

This is why margin improvements are worth more than they look. Moving from a 35% to a 45% margin sounds incremental. It takes your break-even from 2.86× to 2.22×, which can be the difference between a channel that works and one that never will.

## The trap: markup is not margin

The single most common way this calculation goes wrong is using markup where margin belongs.

A product bought at 55 and sold at 100 carries an **82% markup**. Its **margin is 45%**. Feed 82% into the formula and you get a break-even ROAS of 1.22×, against a real figure of 2.22×. You would happily run campaigns at 1.5× believing they were profitable while losing money on every single order.

If you are unsure which figure you have, [Markup vs Margin](/guides/markup-vs-margin) covers the distinction and how to convert between them.

## Break-even is a floor, not a target

At exactly break-even, advertising contributes precisely nothing. It has paid for the goods and paid for itself, and there is nothing left for rent, software, salaries, or you.

Your actual target has to sit above it by enough to cover fixed costs and leave a profit. A common approach is to aim for around 1.5 times break-even, but the honest way to set it is to work out what your fixed costs are per month, decide what profit you want, and calculate the contribution the channel needs to make.

There is also a legitimate reason to run *below* break-even: if a first order reliably leads to repeat purchases, you may be buying a customer rather than a sale. That only holds if you can evidence the repeat behaviour from your own data, and if you have the cash to wait for it. "We'll make it up on lifetime value" is a real strategy and also the most popular way to lose money slowly.

## Things that quietly move the number

- **Returns.** In apparel especially, effective margin is well below the per-unit calculation. A 20% return rate on items you cannot resell changes the picture materially.
- **Discounting.** Every promotion lowers the average margin, which raises break-even ROAS for the period. The campaign that was profitable in March may not be during a sale.
- **Product mix.** One break-even figure across a catalogue with varying margins will overspend on the worst items. Calculate per product, or at least per category.
- **Attribution.** Platform-reported ROAS is usually higher than what your store sees. Compare like with like, and know which number you are judging against the benchmark.

## The short version

- A good ROAS is set by your gross margin. Industry benchmarks are noise.
- Break-even ROAS = 1 ÷ gross margin. At a 40% margin that is 2.50×.
- Use margin, never markup. The error runs in the dangerous direction.
- Break-even is the floor. Set your target above it deliberately.
- Recalculate when margins change, which they do more often than you think.

The [Break-Even ROAS Calculator](/tools/break-even-roas-calculator) does this from a price and your unit costs, and the [ROAS Calculator](/tools/roas-calculator) tells you what you are actually achieving to compare against it.`,
};
