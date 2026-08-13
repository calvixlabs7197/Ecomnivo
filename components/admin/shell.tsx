"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";

import { logout } from "@/actions/auth";
import { Logo } from "@/components/layout/logo";
import { activeNavItem, navFor } from "@/components/admin/nav";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * The admin chrome: a persistent sidebar on desktop, a drawer on mobile, and a
 * top bar that always says where you are.
 *
 * This is the only client component in the shell, and it is one because three
 * things genuinely need the browser: the active-link highlight (`usePathname`),
 * the drawer's open state, and closing that drawer on Escape. Everything it
 * wraps is still server-rendered — `children` arrives as an already-rendered
 * tree, so pages keep their server data access.
 *
 * Nav links are filtered by role for tidiness, never for security: every page
 * re-checks with `requireRole`, because hiding a link stops nobody who can type
 * a URL.
 */
export function AdminShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const groups = navFor(role);
  const current = activeNavItem(pathname);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-surface">
      {/* --- desktop sidebar ------------------------------------------------ */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-rule lg:bg-page">
        <SidebarBody groups={groups} pathname={pathname} role={role} />
      </div>

      {/* --- mobile drawer -------------------------------------------------- */}
      {drawerOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="animate-fade-in fixed inset-0 z-40 bg-ink/30"
          />
          <div
            id="admin-drawer"
            className="animate-slide-in-left fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-page shadow-lg"
          >
            <div className="flex items-center justify-end px-2 pt-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-2 text-muted hover:bg-surface hover:text-ink"
                aria-label="Close menu"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <SidebarBody
              groups={groups}
              pathname={pathname}
              role={role}
              showDescriptions
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* --- content -------------------------------------------------------- */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-rule bg-page/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="admin-drawer"
              className="-ml-2 rounded-md p-2 text-muted hover:bg-surface hover:text-ink lg:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted">Admin</p>
              <p className="truncate text-sm font-semibold text-ink">
                {current?.label ?? "Admin"}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-sm border border-rule bg-surface px-2 py-1 text-xs font-medium text-muted sm:inline">
                {ROLE_LABELS[role]}
              </span>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors duration-150 ease-soft hover:bg-surface hover:text-ink"
              >
                <ExternalLink aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">View site</span>
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors duration-150 ease-soft hover:bg-surface hover:text-ink"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarBody({
  groups,
  pathname,
  role,
  showDescriptions = false,
  onNavigate,
}: {
  groups: ReturnType<typeof navFor>;
  pathname: string;
  role: Role;
  showDescriptions?: boolean;
  /**
   * Closes the mobile drawer on the way out. Handled on the link rather than by
   * watching the pathname, so the drawer is never left covering the page it
   * just navigated to.
   */
  onNavigate?: () => void;
}) {
  const active = activeNavItem(pathname);

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <Link href="/admin" className="rounded-sm" onClick={onNavigate}>
          <Logo />
        </Link>
        <span className="rounded-sm border border-rule bg-surface px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-muted">
          Admin
        </span>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-6">
        {groups.map((group) => (
          <div key={group.heading} className="mt-5 first:mt-0">
            <p className="px-2 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
              {group.heading}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active?.href === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative flex items-start gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-all duration-150 ease-soft",
                        isActive
                          ? "bg-brand-tint text-brand-hover"
                          : "text-muted hover:translate-x-0.5 hover:bg-surface hover:text-ink",
                      )}
                    >
                      {/* A rail on the active item, so which screen you are on
                          is legible from the shape of the sidebar alone. */}
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand"
                        />
                      ) : null}
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 size-4 shrink-0 transition-transform duration-150 ease-soft",
                          isActive ? "text-brand" : "group-hover:scale-110",
                        )}
                      />
                      <span className="min-w-0">
                        {item.label}
                        {showDescriptions ? (
                          <span className="mt-0.5 block text-xs font-normal text-muted">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-rule px-5 py-4">
        <p className="text-xs text-muted">Signed in as</p>
        <p className="text-sm font-medium text-ink">{ROLE_LABELS[role]}</p>
      </div>
    </>
  );
}
