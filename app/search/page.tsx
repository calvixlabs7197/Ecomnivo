import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { buildSearchIndex } from "@/lib/search/build";
import { Container } from "@/components/ui/container";
import { SearchClient } from "@/components/search/search-client";

/**
 * `noindex`, and disallowed in robots.txt.
 *
 * A search results page produces a near-infinite set of thin, duplicative URLs
 * — exactly the pattern §5.4 exists to prevent. It is here for visitors, not
 * for crawlers.
 */
export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search EcomNivo's calculators and guides.",
  path: "/search",
  noindex: true,
});

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const raw = params.q;
  const initialQuery = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const index = await buildSearchIndex();

  return (
    <Container className="py-10 sm:py-14">
      <div className="max-w-reading">
        <h1 className="text-h1">Search</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Every calculator and guide on the site. Results appear as you type.
        </p>
      </div>

      <div className="mt-8 pb-16">
        <SearchClient initialQuery={initialQuery} index={index} />
      </div>
    </Container>
  );
}
