import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";

import { requireStaff } from "@/lib/auth/guards";
import { logout } from "@/actions/auth";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";

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

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/activity", label: "Activity" },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireStaff();

  return (
    <div className="min-h-full bg-surface">
      <header className="border-b border-rule bg-page">
        <Container>
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="rounded-sm">
                <Logo />
              </Link>
              <span className="rounded-sm border border-rule bg-surface px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="hidden text-muted sm:inline">
                Signed in as {session.role.replace("_", " ")}
              </span>
              <Link href="/" className="text-muted hover:text-ink">
                View site
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="font-medium text-brand transition-colors duration-150 ease-soft hover:text-brand-hover"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <div className="flex flex-col gap-8 py-8 lg:flex-row">
          <nav aria-label="Admin" className="lg:w-48 lg:shrink-0">
            <ul className="flex flex-wrap gap-1 lg:flex-col">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors duration-150 ease-soft hover:bg-page hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </Container>
    </div>
  );
}
