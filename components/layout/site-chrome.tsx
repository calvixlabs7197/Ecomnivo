"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Hides the public header and footer on the screens that have their own.
 *
 * The admin runs a full application shell — sidebar, top bar, sign-out — and
 * the root layout was stacking the marketing header above it, so the sidebar
 * overlapped the logo and the page carried two navigations that disagreed
 * about where you were.
 *
 * **Why this rather than route groups.** The textbook fix is two root layouts
 * under `app/(site)` and `app/(admin)`, which means moving forty route files,
 * splitting the metadata and font setup, and losing the single global
 * `not-found`. This is one component and one condition, and it costs the admin
 * a header it renders and then discards — a few hundred bytes on a page only
 * staff ever load. When the app grows a second public shell, the route-group
 * refactor becomes worth it; today it is not.
 *
 * The check is on `usePathname`, which is available during server rendering
 * too, so the chrome is absent from the HTML rather than removed after paint.
 */
const BARE_ROUTES = ["/admin", "/login"];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isBare = BARE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isBare) return null;

  return <>{children}</>;
}
