import type { CategorySlug } from "@/config/categories";
import type { FaqItem } from "@/components/ui/accordion";

/**
 * `live`    — the calculator is implemented, tested, and has a routable page.
 * `planned` — listed in the catalog so the roadmap is honest, but it has no
 *             page and must never be linked to or appear in the sitemap.
 *
 * Nothing becomes `live` until it has a verified formula, a worked example,
 * result interpretation, at least three FAQs and two related links. That rule
 * is what keeps the site free of thin pages (docs/ARCHITECTURE.md §5.4), and
 * `registry.ts` enforces it at module load rather than by review alone.
 */
export type ToolStatus = "live" | "planned";

/**
 * The listing-level facts about a tool: enough to render a card, a category
 * page and a sitemap entry, and nothing more.
 *
 * Kept separate from `ToolDefinition` so that listing pages never pull a
 * calculation engine into their bundle just to render a title and a
 * description.
 */
export interface ToolSummary {
  /** URL segment. `/tools/<slug>`. Lowercase, hyphenated, never changes once live. */
  slug: string;
  name: string;
  /** One sentence. Used on cards and as the meta description fallback. */
  shortDescription: string;
  category: CategorySlug;
  status: ToolStatus;
  /** Surfaced in the homepage "Popular Tools" grid. Six at most. */
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/**
 * How a field is labelled, prefixed and validated.
 *
 * `currency` renders the active currency symbol; `percent` renders a trailing
 * %; `integer` rejects fractions (you cannot have 2.5 clicks).
 */
export type FieldKind = "currency" | "number" | "percent" | "integer";

export interface ToolField {
  /** Key into the input record. Must match a key of the tool's input type. */
  name: string;
  /** Visible <label>. Never placeholder-only. */
  label: string;
  kind: FieldKind;
  /** One line under the input, for the definition a beginner needs. */
  help?: string;
  min?: number;
  max?: number;
  /** Defaults to true. Optional fields are treated as 0 when left empty. */
  optional?: boolean;
  /** Prefilled on load and restored by Reset. */
  defaultValue?: number;
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/**
 * `percent` values are the percentage number itself — 24 means 24%, not 0.24.
 * `ratio` values render as "2.50x".
 */
export type ResultFormat = "currency" | "percent" | "ratio" | "number";

export interface ToolResult {
  key: string;
  label: string;
  /**
   * `null` means "undefined for these inputs" — a zero denominator, or a
   * target that cannot be reached. It is never NaN and never Infinity; a
   * calculator that prints those has failed at its one job. Pair a null with
   * a `note` that explains why.
   */
  value: number | null;
  format: ResultFormat;
  /** `primary` results get the large display treatment. At most two per tool. */
  emphasis?: "primary" | "secondary";
  /**
   * Only set where the sign genuinely carries meaning — profit above or below
   * zero. Not used for ROAS, where "good" depends on a margin this tool does
   * not know.
   */
  tone?: "neutral" | "positive" | "negative";
  /**
   * Shown under the value.
   *
   * Whenever a tool returns any null, at least one of its results must carry a
   * note explaining why — enforced by the engine invariant tests. Not every
   * null needs its own note: when a primary result explains that ad spend is
   * zero, repeating it on the derived percentage is noise.
   */
  note?: string;
}

// ---------------------------------------------------------------------------
// Definition
// ---------------------------------------------------------------------------

export type ToolInput = Record<string, number>;

/**
 * The calculating half of a tool: its inputs and its maths, and nothing else.
 *
 * This is deliberately separate from `ToolDefinition`. `compute` is a function,
 * so it cannot be passed across the server/client boundary as a prop — the
 * client island has to import it. Keeping the engine in its own module means
 * the island imports arithmetic and field labels only, instead of dragging
 * every tool's FAQs, worked example and explanatory prose into the browser
 * bundle for text that is already server-rendered in the HTML.
 *
 * `compute` must be **pure and total**: no I/O, no clock, no randomness, and
 * it must never throw. Division by zero returns `{ value: null, note }`.
 */
export interface ToolEngine<I extends ToolInput = ToolInput> {
  /** Must match a catalog entry whose status is `live`. */
  slug: string;
  fields: ReadonlyArray<ToolField>;
  compute: (input: I) => ToolResult[];
}

/**
 * The reading half of a tool: everything the page says around the calculator,
 * minus the listing metadata that already lives in the catalog (name,
 * category, short description, status).
 *
 * Server-only in practice — none of this is needed to run a calculation.
 */
export interface ToolDefinition<I extends ToolInput = ToolInput> {
  /** Must match a catalog entry whose status is `live`, and an engine. */
  slug: string;
  /** The single <h1>. Usually the tool name plus its purpose. */
  h1: string;
  /** Two or three sentences above the calculator. */
  intro: string;

  formula: {
    /** Plain-text expression, rendered in a <code> block. */
    expression: string;
    explanation: string;
  };

  /**
   * Type-checked against `I` — the same type parameter the engine uses — so a
   * documented worked example cannot drift from the real formula. The registry
   * additionally checks at build time that these keys match the engine's field
   * names exactly.
   */
  example: {
    inputs: I;
    narrative: string;
  };

  /** How to read the result. One <li> each. */
  interpretation: ReadonlyArray<string>;
  /** Mistakes this specific metric invites. One <li> each. */
  commonMistakes: ReadonlyArray<string>;

  faqs: ReadonlyArray<FaqItem>;

  /** Catalog slugs. At least two, and they must resolve. */
  relatedTools: ReadonlyArray<string>;
  /** Guide slugs. Empty until Phase 4 publishes the guides. */
  relatedGuides: ReadonlyArray<string>;

  seo: {
    title: string;
    description: string;
  };
}
