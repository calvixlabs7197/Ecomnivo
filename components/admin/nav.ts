import type { Route } from "next";
import {
  Activity,
  BookOpen,
  Calculator,
  FileText,
  FolderTree,
  Gauge,
  LayoutDashboard,
  Search,
  ServerCog,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { roleAtLeast, type Role } from "@/lib/auth/roles";

/**
 * The admin's map of itself.
 *
 * One declaration drives the sidebar, the mobile drawer, the page title in the
 * top bar, and the dashboard's quick links — so a new screen appears in all
 * four places by adding a line here, and none of them can drift apart.
 *
 * `minRole` is a *display* rule, not a security one. Hiding a link an editor
 * cannot use is courtesy; the page itself still calls `requireRole`, because
 * anyone can type a URL.
 */
export interface AdminNavItem {
  href: Route;
  label: string;
  /** One line, shown in the mobile drawer and on the dashboard's link cards. */
  description: string;
  icon: LucideIcon;
  minRole: Role;
}

export interface AdminNavGroup {
  heading: string;
  items: readonly AdminNavItem[];
}

export const adminNav: readonly AdminNavGroup[] = [
  {
    heading: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Counts, content health and what changed recently.",
        icon: LayoutDashboard,
        minRole: "editor",
      },
      {
        href: "/admin/activity",
        label: "Activity",
        description: "The append-only record of every admin change.",
        icon: Activity,
        minRole: "editor",
      },
    ],
  },
  {
    heading: "Content",
    items: [
      {
        href: "/admin/tools",
        label: "Calculators",
        description: "Names, descriptions, SEO and visibility for every tool.",
        icon: Calculator,
        minRole: "admin",
      },
      {
        href: "/admin/guides",
        label: "Guides",
        description: "Write, schedule and publish long-form articles.",
        icon: BookOpen,
        minRole: "editor",
      },
      {
        href: "/admin/pages",
        label: "Pages",
        description: "About, the legal set, and any page you add.",
        icon: FileText,
        minRole: "editor",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        description: "The four hubs tools are grouped under.",
        icon: FolderTree,
        minRole: "admin",
      },
    ],
  },
  {
    heading: "Growth",
    items: [
      {
        href: "/admin/seo",
        label: "SEO health",
        description: "Every title, description and indexing decision, audited.",
        icon: Gauge,
        minRole: "editor",
      },
      {
        href: "/admin/search",
        label: "Search index",
        description: "What on-site search can find, and how it ranks.",
        icon: Search,
        minRole: "editor",
      },
    ],
  },
  {
    heading: "System",
    items: [
      {
        href: "/admin/settings",
        label: "Settings",
        description: "Site identity, SEO defaults and public analytics IDs.",
        icon: Settings,
        minRole: "super_admin",
      },
      {
        href: "/admin/access",
        label: "Access",
        description: "Roles, what each one may do, and how sign-in works.",
        icon: ShieldCheck,
        minRole: "admin",
      },
      {
        href: "/admin/system",
        label: "System status",
        description: "Storage backend, environment and configuration checks.",
        icon: ServerCog,
        minRole: "admin",
      },
    ],
  },
] as const;

/** The groups a given role may see, with empty groups dropped. */
export function navFor(role: Role): AdminNavGroup[] {
  return adminNav
    .map((group) => ({
      heading: group.heading,
      items: group.items.filter((item) => roleAtLeast(role, item.minRole)),
    }))
    .filter((group) => group.items.length > 0);
}

export const adminNavItems: readonly AdminNavItem[] = adminNav.flatMap((group) => group.items);

/**
 * The nav entry a URL belongs to.
 *
 * Longest match wins, so `/admin/tools/roas-calculator` resolves to Calculators
 * rather than to the dashboard. The dashboard itself matches exactly and never
 * by prefix — it is the parent of every admin URL, and treating it as one would
 * highlight it on screens that have their own entry, and on ones that have no
 * entry at all.
 */
export function activeNavItem(pathname: string): AdminNavItem | undefined {
  return adminNavItems
    .filter((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}
