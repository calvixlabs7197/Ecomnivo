import { LineChart, Megaphone, Tags, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CATEGORY_SLUGS = [
  "profitability",
  "advertising",
  "pricing",
  "growth",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Category {
  slug: CategorySlug;
  name: string;
  /** One line, used on cards and as the category page sub-heading. */
  tagline: string;
  /** Full paragraph for the category page intro and its meta description. */
  description: string;
  icon: LucideIcon;
}

/**
 * Four categories, ordered by how most sellers actually think about their
 * numbers: what am I making, what am I spending to get it, what should I
 * charge, and how do I grow it.
 */
export const categories: readonly Category[] = [
  {
    slug: "profitability",
    name: "Profitability",
    tagline: "What you actually keep after every cost",
    description:
      "Revenue is not profit. These calculators work out what is left after cost of goods, shipping, payment processing fees, platform costs and advertising — the number that decides whether a product is worth selling at all.",
    icon: Wallet,
  },
  {
    slug: "advertising",
    name: "Advertising",
    tagline: "Whether your ad spend is paying for itself",
    description:
      "Paid traffic is only worth buying while it returns more than it costs. These calculators cover return on ad spend, the break-even point your margin sets, cost per click, and what you need to budget to hit a revenue target.",
    icon: Megaphone,
  },
  {
    slug: "pricing",
    name: "Pricing",
    tagline: "Setting prices that hold their margin",
    description:
      "Markup and margin are not the same number, and confusing them is the fastest way to underprice a product. These calculators handle selling prices, markups, discounts and wholesale tiers without that trap.",
    icon: Tags,
  },
  {
    slug: "growth",
    name: "Growth",
    tagline: "The levers that move revenue",
    description:
      "Revenue comes from traffic, conversion rate and average order value — and keeping a customer is worth more than winning one. These calculators size each lever so you can see which one is worth working on.",
    icon: LineChart,
  },
] as const;

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORY_SLUGS.some((candidate) => candidate === slug);
}
