import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { mainNav, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { NavLink } from "@/components/layout/nav-link";
import { MobileNav } from "@/components/layout/mobile-nav";

/**
 * Sticky header.
 *
 * Translucent with a blur, which reverses an earlier decision worth explaining:
 * the original was solid because `backdrop-filter` repaints on every scroll
 * frame. That cost is real but bounded — it applies to one 68px strip, not a
 * full-screen overlay, and it is what lets the hero's gradient wash read as a
 * continuous surface behind the header rather than stopping dead at a hard
 * white bar. `supports-[backdrop-filter]` keeps the fallback opaque, so a
 * browser without it gets a solid header rather than a transparent one with
 * text scrolling through.
 *
 * The shadow that separates it from the page on scroll is a CSS scroll-driven
 * animation — no listener, no JavaScript.
 */
export function Header() {
  return (
    <header className="scroll-elevate sticky top-0 z-40 border-b border-rule bg-page/95 supports-[backdrop-filter]:bg-page/80 supports-[backdrop-filter]:backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.25rem] sm:gap-6">
          <Link
            href="/"
            className="shrink-0 rounded-sm transition-transform duration-200 ease-soft hover:scale-[1.03]"
            aria-label={`${siteConfig.name} home`}
          >
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1 text-sm font-medium">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} variant="pill">
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {/*
              Named just "Search" — the input on /search carries the fuller
              "Search tools and guides". Two controls with the same accessible
              name on one page is confusing to announce.
            */}
            <Link
              href="/search"
              aria-label="Search"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-rule bg-surface px-3 text-sm text-muted transition-colors duration-150 ease-soft hover:border-rule-strong hover:text-ink"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="hidden lg:inline">Search</span>
            </Link>

            <Link
              href="/tools"
              className="press group inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-white shadow-sm transition duration-150 ease-soft hover:bg-brand-hover hover:shadow-brand"
            >
              Explore Tools
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 ease-soft group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
