import {
  BadgePercent,
  BarChart3,
  Coins,
  LineChart,
  Megaphone,
  PiggyBank,
  ShoppingCart,
  Tags,
  Target,
  Truck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The icons a category may use.
 *
 * An allow-list, not a lookup into everything lucide exports. The icon name is
 * admin-editable, so it is untrusted input: resolving an arbitrary string
 * against the whole library would mean shipping any of a thousand components
 * on the say-so of a text field, and a typo would render nothing with no
 * explanation. Eleven named options cover the subject matter, and anything
 * unrecognised falls back rather than failing.
 */
export const ICON_CHOICES = {
  Wallet,
  Megaphone,
  Tags,
  LineChart,
  BarChart3,
  Coins,
  PiggyBank,
  ShoppingCart,
  Target,
  Truck,
  BadgePercent,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_CHOICES;

export const ICON_NAMES = Object.keys(ICON_CHOICES) as IconName[];

export function isIconName(name: string): name is IconName {
  return name in ICON_CHOICES;
}

/** The named icon, or the supplied fallback if the name is not on the list. */
export function getIcon(name: string | undefined, fallback: LucideIcon): LucideIcon {
  if (name && isIconName(name)) return ICON_CHOICES[name];
  return fallback;
}

/** The name a built-in icon component is registered under, for form defaults. */
export function iconNameOf(icon: LucideIcon): IconName | undefined {
  return ICON_NAMES.find((name) => ICON_CHOICES[name] === icon);
}
