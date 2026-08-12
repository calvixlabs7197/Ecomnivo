import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150 ease-soft disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary:
    "border border-rule-strong bg-page text-ink hover:bg-surface hover:border-rule-strong",
  ghost: "text-ink hover:bg-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * Style function rather than a polymorphic `as` prop.
 *
 * Links and buttons are genuinely different elements — one navigates, one
 * acts — and typed routes only work on a real `<Link href>`. Sharing the
 * styles while keeping the elements distinct avoids both the typing gymnastics
 * and the accessibility bugs that come from a <button> that navigates.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonStyles({ variant, size, className })} {...props} />
  );
}
