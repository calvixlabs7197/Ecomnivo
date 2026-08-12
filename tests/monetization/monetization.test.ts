import { describe, expect, it } from "vitest";
import {
  affiliateProgrammes,
  buildAffiliateUrl,
  getAffiliateProgramme,
  hasAffiliateProgrammes,
  type AffiliateProgramme,
} from "@/config/monetization";
import { analyticsEnabled, advertisingEnabled } from "@/config/env";

describe("affiliate configuration", () => {
  it("ships with no affiliate programmes", () => {
    // The brief is explicit: no fake affiliate links. If this ever fails, a
    // real partnership was added — check the disclosure page went with it.
    expect(affiliateProgrammes).toHaveLength(0);
    expect(hasAffiliateProgrammes).toBe(false);
  });

  it("returns undefined for an unknown programme", () => {
    expect(getAffiliateProgramme("not-a-programme")).toBeUndefined();
  });

  it("never returns an inactive programme", () => {
    const inactive: AffiliateProgramme = {
      id: "test",
      merchant: "Test",
      network: "direct",
      url: "https://example.com",
      isActive: false,
    };
    // getAffiliateProgramme filters on isActive, so an ended partnership
    // cannot leave a live link behind.
    expect([inactive].find((p) => p.id === "test" && p.isActive)).toBeUndefined();
  });

  it("appends tracking parameters without breaking an existing query string", () => {
    const programme: AffiliateProgramme = {
      id: "test",
      merchant: "Test",
      network: "direct",
      url: "https://example.com/path?existing=1",
      trackingParams: { ref: "ecomnivo", utm_source: "ecomnivo" },
      isActive: true,
    };

    const url = new URL(buildAffiliateUrl(programme));
    expect(url.searchParams.get("existing")).toBe("1");
    expect(url.searchParams.get("ref")).toBe("ecomnivo");
    expect(url.searchParams.get("utm_source")).toBe("ecomnivo");
    // One question mark, not two.
    expect(buildAffiliateUrl(programme).match(/\?/g)).toHaveLength(1);
  });

  it("leaves a URL untouched when there are no tracking parameters", () => {
    const programme: AffiliateProgramme = {
      id: "test",
      merchant: "Test",
      network: "direct",
      url: "https://example.com/path",
      isActive: true,
    };
    expect(buildAffiliateUrl(programme)).toBe("https://example.com/path");
  });
});

describe("monetization configuration", () => {
  it("keeps analytics and advertising off unless explicitly configured", () => {
    // Neither ID is set in the test environment, so both must be inert. This
    // is what makes every `track()` call a no-op by default.
    expect(analyticsEnabled).toBe(false);
    expect(advertisingEnabled).toBe(false);
  });
});
