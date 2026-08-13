import { CircleDollarSign, ShieldCheck, ShoppingBag, Sparkles, Zap } from "lucide-react";

/**
 * Five claims, each with the specific reason it is true.
 *
 * "Fast" on its own is marketing. "Fast because the page is static and the
 * maths runs in your browser" is a fact a reader can check, and it commits us
 * to keeping it true.
 */
const reasons = [
  {
    icon: Zap,
    title: "Fast",
    body: "Pages are statically served and the maths runs in your browser. Results update as you type — no spinner, no round trip.",
  },
  {
    icon: CircleDollarSign,
    title: "Free",
    body: "Every calculator is free, with no account, no trial and no cap on how often you use it.",
  },
  {
    icon: ShieldCheck,
    title: "Accurate",
    body: "Each formula is derived by hand and covered by unit tests before it ships, including the zero and negative cases that break most calculators.",
  },
  {
    icon: Sparkles,
    title: "Easy to use",
    body: "Plain-language labels, sensible defaults, and an explanation of what the number means — not just the number.",
  },
  {
    icon: ShoppingBag,
    title: "Built for e-commerce",
    body: "Designed around how online sellers actually operate: platform fees, ad spend, shipping costs and repeat purchase.",
  },
] as const;

export function WhyEcomNivo() {
  return (
    <ul className="stagger grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
      {reasons.map((reason) => {
        const Icon = reason.icon;
        return (
          <li key={reason.title} className="reveal animate-delay group flex flex-col gap-2.5">
            <span className="inline-flex size-10 items-center justify-center rounded-md bg-brand-tint text-brand transition-transform duration-200 ease-soft group-hover:scale-110">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="font-semibold text-ink">{reason.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{reason.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
