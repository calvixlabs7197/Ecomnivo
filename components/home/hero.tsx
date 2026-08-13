import type { CSSProperties } from "react";
import { Check, Sparkles } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { buttonStyles } from "@/components/ui/button";
import { TrackedLink } from "@/components/analytics/tracked-link";

const assurances = ["No signup", "No usage limits", "Free to use"];

/**
 * Hero.
 *
 * Still text only. The largest element on the page is a heading already in the
 * HTML, so the LCP element needs no image decode and no JavaScript — the wash
 * behind it is two radial gradients on a pseudo-element, which costs nothing
 * to decode and cannot delay paint.
 *
 * The entrance animation is deliberately short and runs once. Anything longer
 * on a first load is a page that appears slow in exchange for looking
 * expensive, which is a bad trade on a site people arrive at from search.
 */
export function Hero({
  toolCount,
  categoryCount,
  guideCount,
}: {
  toolCount: number;
  categoryCount: number;
  guideCount: number;
}) {
  const stats = [
    { value: toolCount, label: toolCount === 1 ? "calculator" : "calculators" },
    { value: categoryCount, label: "categories" },
    { value: guideCount, label: guideCount === 1 ? "guide" : "guides" },
  ];

  return (
    <section className="aurora grid-veil relative border-b border-rule">
      <Container>
        <div className="mx-auto max-w-3xl pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
          <div
            className="stagger flex flex-col items-center"
            style={{ "--stagger": "90ms" } as CSSProperties}
          >
            <p className="animate-fade-up animate-delay inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3.5 py-1.5 text-sm font-medium text-brand-hover">
              <Sparkles aria-hidden="true" className="size-3.5" />
              {toolCount} free calculators for online sellers
            </p>

            <h1 className="animate-fade-up animate-delay mt-6 text-h1 text-ink sm:text-display">
              {siteConfig.tagline}
            </h1>

            <p className="animate-fade-up animate-delay mx-auto mt-6 max-w-reading text-lead text-muted">
              {siteConfig.description}
            </p>

            <div className="animate-fade-up animate-delay mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
              <TrackedLink
                href="/tools"
                location="hero"
                label="explore-tools"
                className={buttonStyles({
                  size: "lg",
                  className: "w-full shadow-brand hover:-translate-y-0.5 sm:w-auto",
                })}
              >
                Explore Tools
              </TrackedLink>
              <TrackedLink
                href="/guides"
                location="hero"
                label="browse-guides"
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                Browse Guides
              </TrackedLink>
            </div>

            <ul className="animate-fade-up animate-delay mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
              {assurances.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check aria-hidden="true" className="size-4 text-positive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/*
            Real counts, read from the store at request time. A hero that
            advertises "50+ tools" it does not have is the kind of copy that
            has to be maintained by hand and eventually lies.
          */}
          <dl
            className="animate-fade-up animate-delay mx-auto mt-12 grid max-w-lg grid-cols-3 divide-x divide-rule border-y border-rule py-5"
            style={{ "--delay": "540ms" } as CSSProperties}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="px-2">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-3xl font-bold tabular-nums text-ink">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
