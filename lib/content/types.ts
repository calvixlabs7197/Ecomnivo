/**
 * The shape of editable content.
 *
 * These mirror the `guides` and `pages` tables in
 * `supabase/migrations/0001_schema.sql` so that swapping the file-backed
 * source for the database one in Phase 5 changes the source module and
 * nothing else.
 */

export interface GuideAuthor {
  name: string;
  /** Optional — a real person's page, once there are real people. */
  slug?: string;
}

export interface GuideDoc {
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown. Rendered and sanitised on the server. */
  contentMd: string;
  category: string;
  tags: readonly string[];
  author: GuideAuthor;
  /** ISO date. Drives `datePublished` and the sitemap. */
  publishedAt: string;
  /** ISO date. Equal to publishedAt until the guide is edited. */
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  /** False keeps a guide reachable but out of the index and the sitemap. */
  isIndexable: boolean;
  /**
   * Tool slugs this guide explains. The tool pages derive their "related
   * guides" from this, so the relationship is declared once rather than kept
   * in sync by hand at both ends.
   */
  relatedTools: readonly string[];
}

export interface PageDoc {
  slug: string;
  title: string;
  contentMd: string;
  seoTitle?: string;
  seoDescription?: string;
  /** ISO date, shown as "Last updated" on legal pages where it matters. */
  updatedAt: string;
  isIndexable?: boolean;
}
