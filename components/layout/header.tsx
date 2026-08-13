import Link from "next/link";
import { Search } from "lucide-react";
import { mainNav, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { NavLink } from "@/components/layout/nav-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonStyles } from "@/components/ui/button";

/**
 * Sticky header, solid background.
 *
 * Solid rather than translucent-with-blur: `backdrop-filter` repaints on every
 * scroll frame, and the brief asks for speed over the glassmorphism look. It
 * does gain a shadow as the page scrolls under it — a CSS scroll-driven
 * animation, so that separation costs no JavaScript and no scroll listener.
 */
export function Header() {
  return (
    <header className="scroll-elevate sticky top-0 z-40 border-b border-rule bg-page">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="rounded-sm transition-transform duration-200 ease-soft hover:scale-[1.03]"
            aria-label={`${siteConfig.name} home`}
          >
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm font-medium">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href}>{item.label}</NavLink>
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
              className="inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-soft hover:bg-surface hover:text-ink"
            >
              <Search className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/tools" className={buttonStyles({ size: "sm" })}>
              Explore Tools
            </Link>
          </div>

          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
