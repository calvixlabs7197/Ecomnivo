import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A card is a border and a radius. Not a shadow, not a gradient, not an accent
 * rail. Elevation is reserved for things that genuinely float (the mobile nav),
 * so it still means something when it appears.
 */
export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  /** Adds hover affordance. Only for cards that are themselves a link. */
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-rule/90 bg-page shadow-[0_1px_2px_rgb(15_23_42/0.03)]",
        interactive &&
          "transition-colors duration-150 ease-soft hover:border-brand/20 hover:bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
