import Link from "next/link";

import { Container } from "@/components/ui/container";
import { buttonStyles } from "@/components/ui/button";
import { categories } from "@/config/categories";

/**
 * 404.
 *
 * Gives the visitor somewhere to go rather than just an apology — most 404s
 * here will be a mistyped or outdated tool URL, so the category hubs are the
 * useful next step.
 */
export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <div className="mx-auto max-w-reading text-center">
        <p className="text-eyebrow uppercase text-muted">Error 404</p>
        <h1 className="mt-3 text-h1">This page does not exist</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
          The link may be out of date, or the tool you are looking for may not have been
          published yet.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/tools" className={buttonStyles({ className: "w-full sm:w-auto" })}>
            Browse all tools
          </Link>
          <Link
            href="/"
            className={buttonStyles({
              variant: "secondary",
              className: "w-full sm:w-auto",
            })}
          >
            Go to homepage
          </Link>
        </div>

        <div className="mt-14 border-t border-rule pt-8">
          <h2 className="text-eyebrow uppercase text-muted">Or jump to a category</h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-brand transition-colors duration-150 ease-soft hover:text-brand-hover"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
