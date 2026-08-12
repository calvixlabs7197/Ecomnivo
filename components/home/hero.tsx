import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { buttonStyles } from "@/components/ui/button";
import { TrackedLink } from "@/components/analytics/tracked-link";

const assurances = ["No signup", "No usage limits", "Free to use"];

/**
 * Hero.
 *
 * Text only, by design: the largest element on the page is a heading that is
 * already in the HTML, so the LCP element needs no image decode and no
 * JavaScript. That is worth more than a screenshot mockup would be.
 */
export function Hero() {
  return (
    <section className="border-b border-rule">
      <Container>
        <div className="mx-auto max-w-3xl py-20 text-center sm:py-28">
          <h1 className="text-h1 text-ink sm:text-display">{siteConfig.tagline}</h1>

          <p className="mx-auto mt-6 max-w-reading text-lead text-muted">
            {siteConfig.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <TrackedLink
              href="/tools"
              location="hero"
              label="explore-tools"
              className={buttonStyles({ size: "lg", className: "w-full sm:w-auto" })}
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

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted">
            {assurances.map((item, index) => (
              <li key={item} className="flex items-center gap-3">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-rule-strong">
                    &middot;
                  </span>
                ) : null}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
