import type { CategoryAccent } from "@/config/categories";

/**
 * Accent name → the two classes that paint an icon chip.
 *
 * Written out in full rather than built as `bg-accent-${name}/10`, because
 * Tailwind scans source text for class names: an interpolated one is never
 * generated and silently renders unstyled.
 */
export const accentChip: Record<CategoryAccent, string> = {
  profit: "bg-accent-profit/10 text-accent-profit",
  ads: "bg-accent-ads/10 text-accent-ads",
  price: "bg-accent-price/10 text-accent-price",
  growth: "bg-accent-growth/10 text-accent-growth",
};
