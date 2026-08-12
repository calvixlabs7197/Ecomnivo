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
}: {
  href: Href;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const target = toPath(href);
  const isActive =
    target !== "/" && (pathname === target || pathname.startsWith(`${target}/`));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "transition-colors duration-150 ease-soft",
        isActive ? "text-ink" : "text-muted hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}
