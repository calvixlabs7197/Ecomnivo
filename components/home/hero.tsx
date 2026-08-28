import type { CSSProperties } from "react";
import { ArrowUpRight, Check, Sparkles, TrendingUp } from "lucide-react";

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
        <div className="grid items-center gap-14 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:min-h-[calc(100svh-4.25rem)] lg:grid-cols-[1.04fr_.96fr] lg:gap-16 lg:py-24">
          <div>
            <div
              className="stagger flex flex-col items-start text-left"
              style={{ "--stagger": "90ms" } as CSSProperties}
            >
            {/* text-xs below `sm` keeps this on one line at 320px, where
                wrapping leaves the icon stranded beside a two-line label. */}
            <p className="animate-fade-up animate-delay inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3 py-1.5 text-xs font-medium text-brand-hover sm:px-3.5 sm:text-sm">
              <Sparkles aria-hidden="true" className="size-3.5" />
              {toolCount} free calculators for online sellers
            </p>

            <h1 className="animate-fade-up animate-delay mt-6 max-w-2xl text-[clamp(2.6rem,8vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.055em] text-ink">
              Smarter numbers. <span className="text-gradient">Stronger stores.</span>
            </h1>

            <p className="animate-fade-up animate-delay mt-6 max-w-xl text-base leading-7 text-muted sm:text-lead">
              {siteConfig.description}
            </p>

            <div className="animate-fade-up animate-delay mt-9 flex w-full flex-col gap-3 min-[420px]:w-auto min-[420px]:flex-row">
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

            <ul className="animate-fade-up animate-delay mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
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
              className="animate-fade-up animate-delay mt-10 grid w-full max-w-lg grid-cols-3 divide-x divide-rule rounded-xl border border-white/70 bg-white/55 py-4 shadow-sm backdrop-blur-xl"
              style={{ "--delay": "540ms" } as CSSProperties}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="px-2">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-3xl font-bold tabular-nums text-ink">
                      {stat.value}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="animate-fade-up relative mx-auto w-full max-w-xl lg:max-w-none"
            style={{ animationDelay: "180ms" }}
          >
            <div className="hero-orbit absolute -inset-5 rounded-[2.25rem] border border-brand/10 sm:-inset-8" />
            <div className="premium-panel relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-[0_32px_80px_-28px_rgb(15_23_42/0.32)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
              <div className="flex items-center justify-between border-b border-rule/80 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Example profit snapshot
                  </p>
                  <p className="mt-1 font-semibold text-ink">Store performance</p>
                </div>
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand text-white shadow-brand">
                  <TrendingUp aria-hidden="true" className="size-5" />
                </span>
              </div>
              <div className="mt-5 grid gap-3 min-[420px]:grid-cols-2">
                <div className="rounded-2xl border border-rule/80 bg-white/80 p-4">
                  <p className="text-xs text-muted">Monthly revenue</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">$48,240</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-positive">
                    <ArrowUpRight aria-hidden="true" className="size-3.5" /> 12.8% this month
                  </p>
                </div>
                <div className="rounded-2xl border border-rule/80 bg-white/80 p-4">
                  <p className="text-xs text-muted">Net margin</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">24.6%</p>
                  <p className="mt-2 text-xs font-medium text-brand">Healthy range</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-rule/80 bg-white/80 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted">Revenue trend</p>
                    <p className="mt-1 text-sm font-semibold text-ink">Last 6 months</p>
                  </div>
                  <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand">
                    +18.4%
                  </span>
                </div>
                <div className="mt-6 flex h-28 items-end gap-2 sm:h-36 sm:gap-3" aria-hidden="true">
                  {[42, 55, 48, 68, 74, 92].map((height, index) => (
                    <span
                      key={height}
                      className="chart-bar block flex-1 origin-bottom rounded-t-lg bg-gradient-to-t from-brand to-violet-400"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${420 + index * 70}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="floating-chip absolute -bottom-5 right-3 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:flex lg:-right-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-positive">
                <Check aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted">Break-even ROAS</p>
                <p className="text-sm font-bold text-ink">1.84x</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
