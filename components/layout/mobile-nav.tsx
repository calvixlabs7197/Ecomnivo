"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { mainNav } from "@/config/site";
import { NavLink } from "@/components/layout/nav-link";
import { buttonStyles } from "@/components/ui/button";

/**
 * Mobile navigation panel.
 *
 * Implemented as a real modal dialog rather than a slide-down div: it takes
 * focus on open, traps Tab inside itself, closes on Escape, returns focus to
 * the trigger, and locks background scroll. A nav drawer that leaves focus
 * behind on the page underneath is the most common a11y bug on mobile sites.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  const close = useCallback(() => setOpen(false), []);

  // Navigating away closes the panel — including via browser back/forward,
  // which never fires a link's onClick. Adjusted during render rather than in
  // an effect: an effect would paint the overlay over the new page first, then
  // remove it in a second pass.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusables?.item(0)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusables || focusables.length === 0) return;

      const first = focusables.item(0);
      const last = focusables.item(focusables.length - 1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors duration-150 ease-soft hover:bg-surface active:bg-surface-strong"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      {/*
        Portalled to <body>, not left where it sits in the tree.
        The header applies `backdrop-filter`, and a filtered element becomes the
        containing block for its `fixed` descendants — so this panel was being
        positioned and clipped inside the 68px header strip rather than covering
        the viewport. Rendering it at the document root restores what `fixed`
        is supposed to mean. Only ever reached with `open` true, which is
        client-only state, so there is no server-render to guard against.
      */}
      {open
        ? createPortal(
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          // Plain gradient rather than `.aurora`: that utility clips its own
          // overflow, which a scrolling panel cannot have.
          // `bg-page` under the gradient, not instead of it: the gradient's top
          // stop is a 50% tint, so without an opaque base the page scrolls
          // visibly through the top half of the panel.
          className="animate-fade-in fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col overflow-y-auto border-t border-rule bg-page bg-gradient-to-b from-brand-tint/50 to-page px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4"
        >
          <nav aria-label="Main">
            {/*
              Rows rather than a bare list: each is a 56px target with the
              destination and an arrow, which is what a thumb is aiming at. The
              stagger runs once as the sheet opens.
            */}
            <ul
              className="stagger flex flex-col gap-1"
              style={{ "--stagger": "45ms" } as CSSProperties}
            >
              {mainNav.map((item) => (
                <li key={item.href} className="animate-fade-up animate-delay">
                  <NavLink
                    href={item.href}
                    onNavigate={close}
                    className="flex min-h-14 items-center justify-between gap-3 rounded-lg px-3 text-lg font-medium hover:bg-surface active:bg-surface-strong"
                  >
                    {item.label}
                    <ArrowRight aria-hidden="true" className="size-4 text-muted" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link
              href="/search"
              onClick={close}
              className={buttonStyles({
                variant: "secondary",
                size: "lg",
                className: "w-full",
              })}
            >
              <Search className="size-4" aria-hidden="true" />
              Search
            </Link>
            <Link
              href="/tools"
              onClick={close}
              className={buttonStyles({ size: "lg", className: "w-full" })}
            >
              Explore Tools
            </Link>
            <p className="pt-2 text-center text-sm text-muted">
              Free to use · No signup
            </p>
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}
