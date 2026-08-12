import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one horizontal rhythm for the site: 1200px max, with gutters that grow
 * with the viewport. Nothing sets its own page margins.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-page px-5 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
