import type { CategorySlug } from "@/config/categories";
import { CATEGORY_SLUGS } from "@/config/categories";
import type { ToolSummary } from "@/lib/tools/types";

/**
 * The full tool catalog.
 *
 * Every entry is `planned` until Phase 2 implements and tests its calculation
 * engine. Listing planned tools is not a thin-content risk because they have no
 * pages — they render as an inert card, are excluded from the sitemap, and are
 * never linked. It keeps the roadmap visible without pretending anything is
 * ready.
 *
 * Descriptions are written to be distinguishable from each other. Two tools
 * that need near-identical descriptions are usually one tool.
 */
export const toolCatalog: readonly ToolSummary[] = [
  // --- Advertising ---------------------------------------------------------
  {
    slug: "roas-calculator",
    name: "ROAS Calculator",
    shortDescription:
      "Work out the revenue you earn back for every unit of currency you spend on ads.",
    category: "advertising",
    status: "live",
    featured: true,
  },
  {
    slug: "break-even-roas-calculator",
    name: "Break-Even ROAS Calculator",
    shortDescription:
      "Find the minimum ROAS your gross margin needs before advertising starts losing money.",
    category: "advertising",
    status: "live",
    featured: true,
  },
  {
    slug: "cpc-calculator",
    name: "CPC Calculator",
    shortDescription:
      "Cost per click from spend and clicks, and what that click price implies for your CPA.",
    category: "advertising",
    status: "live",
    featured: true,
  },
  {
    slug: "cpm-calculator",
    name: "CPM Calculator",
    shortDescription:
      "Cost per thousand impressions, for comparing reach-based buys on a level footing.",
    category: "advertising",
    status: "live",
  },
  {
    slug: "ctr-calculator",
    name: "CTR Calculator",
    shortDescription:
      "Click-through rate from impressions and clicks, with context on what counts as healthy.",
    category: "advertising",
    status: "live",
  },
  {
    slug: "cpa-calculator",
    name: "CPA Calculator",
    shortDescription:
      "Cost per acquisition from ad spend and conversions, measured at the campaign level.",
    category: "advertising",
    status: "live",
  },
  {
    slug: "cac-calculator",
    name: "CAC Calculator",
    shortDescription:
      "Full customer acquisition cost including sales and marketing overhead, not just ad spend.",
    category: "advertising",
    status: "live",
  },
  {
    slug: "ad-budget-calculator",
    name: "Ad Budget Calculator",
    shortDescription:
      "The monthly and daily budget required to reach a revenue goal at a target ROAS.",
    category: "advertising",
    status: "live",
    featured: true,
  },

  // --- Profitability -------------------------------------------------------
  {
    slug: "ecommerce-profit-calculator",
    name: "E-commerce Profit Calculator",
    shortDescription:
      "Net profit and margin after cost of goods, shipping, transaction fees and ad spend.",
    category: "profitability",
    status: "live",
    featured: true,
  },
  {
    slug: "shopify-profit-calculator",
    name: "Shopify Profit Calculator",
    shortDescription:
      "Profit after Shopify Payments rates, per-transaction fees, your plan and app subscriptions.",
    category: "profitability",
    status: "live",
  },
  {
    slug: "product-profit-calculator",
    name: "Product Profit Calculator",
    shortDescription:
      "Per-unit profit for a single product, so you can compare SKUs before overheads muddy it.",
    category: "profitability",
    status: "live",
  },
  {
    slug: "profit-margin-calculator",
    name: "Profit Margin Calculator",
    shortDescription:
      "Margin percentage from revenue and cost, with the markup equivalent shown alongside.",
    category: "profitability",
    status: "live",
    featured: true,
  },
  {
    slug: "gross-profit-calculator",
    name: "Gross Profit Calculator",
    shortDescription:
      "Gross profit and gross margin from revenue and cost of goods sold.",
    category: "profitability",
    status: "live",
  },
  {
    slug: "net-profit-calculator",
    name: "Net Profit Calculator",
    shortDescription:
      "Bottom-line profit once every operating expense is taken out, not just cost of goods.",
    category: "profitability",
    status: "live",
  },

  // --- Pricing -------------------------------------------------------------
  {
    slug: "markup-calculator",
    name: "Markup Calculator",
    shortDescription:
      "Markup percentage, the selling price it produces, and the margin that actually results.",
    category: "pricing",
    status: "live",
  },
  {
    slug: "selling-price-calculator",
    name: "Selling Price Calculator",
    shortDescription:
      "The price you need to charge to land on a target margin, from your unit cost.",
    category: "pricing",
    status: "live",
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    shortDescription:
      "Sale price, amount saved, and how much margin the discount leaves you with.",
    category: "pricing",
    status: "live",
  },
  {
    slug: "wholesale-price-calculator",
    name: "Wholesale Pricing Calculator",
    shortDescription:
      "Wholesale price and recommended retail price from unit cost and two markup tiers.",
    category: "pricing",
    status: "live",
  },

  // --- Growth --------------------------------------------------------------
  {
    slug: "conversion-rate-calculator",
    name: "Conversion Rate Calculator",
    shortDescription:
      "Conversion rate from sessions and orders, plus the orders a target rate would add.",
    category: "growth",
    status: "live",
  },
  {
    slug: "aov-calculator",
    name: "AOV Calculator",
    shortDescription:
      "Average order value from revenue and order count, and what lifting it is worth.",
    category: "growth",
    status: "live",
  },
  {
    slug: "revenue-calculator",
    name: "Revenue Calculator",
    shortDescription:
      "Project revenue from traffic, conversion rate and average order value.",
    category: "growth",
    status: "live",
  },
  {
    slug: "ltv-calculator",
    name: "Customer LTV Calculator",
    shortDescription:
      "Margin-adjusted customer lifetime value and the LTV to CAC ratio it implies.",
    category: "growth",
    status: "live",
  },
] as const;

/** Tools with a routable page. The only set that may be linked or indexed. */
export function getLiveTools(): ToolSummary[] {
  return toolCatalog.filter((tool) => tool.status === "live");
}

export function getToolsByCategory(category: CategorySlug): ToolSummary[] {
  return toolCatalog.filter((tool) => tool.category === category);
}

/** Homepage "Popular Tools" — capped at six so the grid stays two clean rows. */
export function getFeaturedTools(): ToolSummary[] {
  return toolCatalog.filter((tool) => tool.featured).slice(0, 6);
}

export function getTool(slug: string): ToolSummary | undefined {
  return toolCatalog.find((tool) => tool.slug === slug);
}

export function countToolsByCategory(category: CategorySlug): number {
  return getToolsByCategory(category).length;
}

/**
 * Guards against a duplicate slug slipping in during a copy-paste edit. A
 * duplicate would produce two pages competing for the same URL, which is an
 * SEO problem that is very hard to spot by eye in a 22-entry list.
 */
const duplicateSlugs = toolCatalog
  .map((tool) => tool.slug)
  .filter((slug, index, all) => all.indexOf(slug) !== index);

if (duplicateSlugs.length > 0) {
  throw new Error(
    `Duplicate tool slugs in catalog: ${[...new Set(duplicateSlugs)].join(", ")}`,
  );
}

const orphanedTools = toolCatalog.filter(
  (tool) => !CATEGORY_SLUGS.some((slug) => slug === tool.category),
);

if (orphanedTools.length > 0) {
  throw new Error(
    `Tools reference unknown categories: ${orphanedTools.map((t) => t.slug).join(", ")}`,
  );
}
