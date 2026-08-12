import type { CategorySlug } from "@/config/categories";
import type { GuideDoc, PageDoc } from "@/lib/content/types";

/**
 * Editable records.
 *
 * Field names mirror the Supabase columns in
 * `supabase/migrations/0001_schema.sql`, so the JSON files import into
 * Postgres without a translation layer.
 */

/**
 * Admin-editable overrides for a tool.
 *
 * Note what is absent: fields, formulas and `compute`. A tool's maths stays in
 * typed, tested code (§0 decision 1) — this record is the SEO and content
 * shell around it. Every property is optional; a missing one means "use the
 * value from the code", which is what lets the site work with an empty store.
 */
export interface ToolRecord {
  slug: string;
  name?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  categorySlug?: CategorySlug;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  /** Overrides the related tools declared in code when non-empty. */
  relatedTools?: string[];
  updatedAt: string;
}

/** A guide, stored. Same shape the file-backed seeds use, plus workflow state. */
export interface GuideRecord extends GuideDoc {
  status: "draft" | "scheduled" | "published";
  createdAt: string;
}

/** A page, stored. Admin can create entirely new ones. */
export interface PageRecord extends PageDoc {
  isPublished: boolean;
  /** False for the built-in legal pages, so they cannot be deleted by accident. */
  isDeletable: boolean;
  createdAt: string;
}

export interface CategoryRecord {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Lucide icon name. Validated against an allow-list before rendering. */
  icon: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}

export interface SettingsRecord {
  siteName: string;
  tagline: string;
  description: string;
  contactEmail: string | null;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  socials: Array<{ label: string; href: string }>;
  /**
   * Public identifiers only. Anything genuinely secret belongs in the
   * environment (§0 decision 7) — these are already visible in the browser.
   */
  ga4MeasurementId: string | null;
  adClientId: string | null;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}
