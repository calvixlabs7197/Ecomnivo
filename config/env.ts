import { z } from "zod";

/**
 * Environment validated once, at module load.
 *
 * A missing or malformed variable fails the build loudly here rather than
 * producing a silently broken page — a wrong NEXT_PUBLIC_SITE_URL would poison
 * every canonical tag, OG tag and sitemap entry without throwing anything.
 *
 * `process.env.X` must be written as a full literal: Next inlines
 * NEXT_PUBLIC_* by static replacement, so dynamic lookups return undefined in
 * the browser.
 */
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url({
    error:
      "NEXT_PUBLIC_SITE_URL must be an absolute URL (e.g. https://ecomnivo.com). Copy .env.example to .env.local.",
  }),

  /**
   * Optional. Analytics and advertising are inert until these are set, and the
   * empty string is normalised to undefined so a blank line in .env.local does
   * not count as "configured".
   */
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, "GA4 measurement IDs look like G-XXXXXXXXXX.")
    .optional(),

  NEXT_PUBLIC_AD_CLIENT_ID: z.string().min(1).optional(),
});

const emptyToUndefined = (value: string | undefined) =>
  value === undefined || value.trim() === "" ? undefined : value;

const parsed = schema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: emptyToUndefined(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
  NEXT_PUBLIC_AD_CLIENT_ID: emptyToUndefined(process.env.NEXT_PUBLIC_AD_CLIENT_ID),
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  · ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = {
  ...parsed.data,
  /** Origin with any trailing slash removed, so `new URL(path, origin)` is safe. */
  SITE_URL: parsed.data.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
} as const;

/**
 * Whether analytics is switched on at all.
 *
 * Everything downstream checks this rather than reading the variable, so there
 * is one definition of "configured" and no chance of a component deciding
 * differently.
 */
export const analyticsEnabled = Boolean(env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);

/** Whether any advertising is configured. */
export const advertisingEnabled = Boolean(env.NEXT_PUBLIC_AD_CLIENT_ID);
