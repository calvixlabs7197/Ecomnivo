import type { ReactNode } from "react";

import { requireStaff } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/shell";

/**
 * Layer 2 of the three admin defences (§8.1), and the authoritative one.
 *
 * `proxy.ts` only checks that a cookie exists — it runs at the edge without
 * the signing secret. This runs on the server, verifies the signature, and
 * every page under /admin inherits it. A forged cookie gets past layer 1 and
 * dies here.
 *
 * `force-dynamic` because an admin page must never be served from a cache
 * built for somebody else.
 */
export const dynamic = "force-dynamic";

/** Nothing under /admin should ever be indexed, whatever a page sets. */
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireStaff();

  return <AdminShell role={session.role}>{children}</AdminShell>;
}
