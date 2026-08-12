/**
 * Affiliate programmes.
 *
 * **Deliberately empty.** EcomNivo has no affiliate partnerships, so there are
 * no affiliate links on the site — the brief is explicit that we do not add
 * fake ones, and /affiliate-disclosure says so publicly.
 *
 * The architecture exists so that adding a real programme is a data change
 * rather than a code change, and so the rules published on the disclosure page
 * are enforced by the component rather than by whoever adds the first link:
 * `rel="sponsored nofollow"`, a visible marker, and an outbound click event.
 *
 * Phase 5 moves this into an `affiliate_links` table with the same shape.
 */
export interface AffiliateProgramme {
  /** Referenced by `<AffiliateLink programme="..." />`. */
  id: string;
  merchant: string;
  /** The network or "direct" for an in-house programme. */
  network: string;
  /** Destination, without tracking parameters. */
  url: string;
  /** Appended to the URL. Kept separate so the base URL stays readable. */
  trackingParams?: Record<string, string>;
  /** An inactive programme renders as plain text, never as a dead link. */
  isActive: boolean;
}

export const affiliateProgrammes: readonly AffiliateProgramme[] = [];

export function getAffiliateProgramme(id: string): AffiliateProgramme | undefined {
  return affiliateProgrammes.find((programme) => programme.id === id && programme.isActive);
}

/** Whether any page needs to carry an affiliate disclosure. */
export const hasAffiliateProgrammes = affiliateProgrammes.some(
  (programme) => programme.isActive,
);

/**
 * Builds the outbound URL with tracking parameters applied.
 *
 * `URL` rather than string concatenation, so a base URL that already carries a
 * query string does not end up with two question marks.
 */
export function buildAffiliateUrl(programme: AffiliateProgramme): string {
  const url = new URL(programme.url);

  for (const [key, value] of Object.entries(programme.trackingParams ?? {})) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}
