import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { resolveCategories } from "@/lib/categories/resolve";
import { Card } from "@/components/ui/card";

/**
 * The four category hubs.
 *
 * Shared by the homepage and /categories so the two can never drift. Icons
 * carry the differentiation instead of four different accent colours — the
 * palette stays restrained and the cards still scan apart at a glance.
 *
 * The copy is resolved from the store rather than read from the config, so an
 * admin rename shows up here and on the hub page at the same time.
 */
export async function CategoryGrid({
  headingLevel = 3,
  counts,
}: {
  /**
   * 2 when the grid is the page's top-level content (/categories), 3 when it
   * sits under a section heading (the homepage). Hardcoding h3 skipped a
   * heading level on /categories.
   */
  headingLevel?: 2 | 3;
  /** Published tool counts, resolved server-side so admin changes are reflected. */
  counts: Record<string, number>;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const categories = await resolveCategories();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const count = counts[category.slug] ?? 0;

        return (
          <li key={category.slug} className="h-full">
            <Link
              href={`/categories/${category.slug}` as Route}
              className="group block h-full rounded-lg"
            >
              <Card interactive className="h-full">
                <div className="flex h-full flex-col gap-3 p-5">
                  <Icon aria-hidden="true" className="size-6 text-brand" />

                  <Heading className="text-h3 text-ink">{category.name}</Heading>

                  <p className="text-sm leading-relaxed text-muted">{category.tagline}</p>

                  <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-brand">
                    {count} {count === 1 ? "tool" : "tools"}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-150 ease-soft group-hover:translate-x-0.5"
                    />
                  </p>
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
