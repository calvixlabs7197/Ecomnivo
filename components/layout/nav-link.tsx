"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Href = ComponentProps<typeof Link>["href"];

function toPath(href: Href): string {
  if (typeof href === "string") return href;
  return href.pathname ?? "";
}

/**
 * A nav link that knows whether it is the current section.
 *
 * Client-side only because it needs the pathname; kept as a leaf component so
 * the header itself stays a Server Component and nothing else gets pulled into
 * the client bundle.
 */
export function NavLink({
  href,
  children,
  className,
  onNavigate,
  variant = "text",
}: {
  href: Href;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  /**
   * `pill` gives the link a hoverable surface and a tinted active state — the
   * desktop header, where four links sit together and need to read as a set of
   * targets. `text` stays plain, for the mobile list and anywhere inline.
   */
  variant?: "text" | "pill";
}) {
  const pathname = usePathname();
  const target = toPath(href);
  const isActive =
    target !== "/" && (pathname === target || pathname.startsWith(`${target}/`));

  const styles =
    variant === "pill"
      ? cn(
          "inline-flex items-center rounded-full px-3 py-2",
          isActive
            ? "bg-brand-tint text-brand-hover"
            : "text-muted hover:bg-surface hover:text-ink",
        )
      : cn(isActive ? "text-ink" : "text-muted hover:text-ink");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn("transition-colors duration-150 ease-soft", styles, className)}
    >
      {children}
    </Link>
  );
}
