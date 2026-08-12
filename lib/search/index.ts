export type SearchKind = "tool" | "guide" | "category";

export interface SearchDoc {
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  /** Extra terms that should match but are not shown, e.g. a category name. */
  keywords: string;
}

/**
 * Ranking, kept pure and free of any data source.
 *
 * The index is now built on the server (see `build.ts`) and handed to the
 * client as a prop, because content lives in an async store that the browser
 * has no access to. Splitting the ranking out keeps it unit-testable without a
 * filesystem.
 *
 * Every term must match somewhere, and matches in the title count for more
 * than matches in the description. Deliberately simple: no stemming, no fuzzy
 * matching, no ranking maths that would need tuning nobody has time to do.
 */
export function searchDocs(index: readonly SearchDoc[], query: string): SearchDoc[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored = index
    .map((doc) => {
      const title = doc.title.toLowerCase();
      const description = doc.description.toLowerCase();
      const keywords = doc.keywords.toLowerCase();

      let score = 0;

      for (const term of terms) {
        const inTitle = title.includes(term);
        const inDescription = description.includes(term);
        const inKeywords = keywords.includes(term);

        if (!inTitle && !inDescription && !inKeywords) return { doc, score: 0 };

        if (inTitle) score += title.startsWith(term) ? 5 : 3;
        if (inDescription) score += 2;
        if (inKeywords) score += 1;
      }

      return { doc, score };
    })
    .filter((entry) => entry.score > 0);

  // Tools first at equal relevance — someone searching this site is usually
  // after a calculator.
  const kindRank: Record<SearchKind, number> = { tool: 0, guide: 1, category: 2 };

  return scored
    .sort((a, b) => b.score - a.score || kindRank[a.doc.kind] - kindRank[b.doc.kind])
    .map((entry) => entry.doc);
}
