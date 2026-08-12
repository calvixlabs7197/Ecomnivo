import { describe, expect, it } from "vitest";
import { cpcEngine } from "@/lib/tools/engines/cpc-calculator";
import { resultFor, valueFor } from "./helpers";

const compute = cpcEngine.compute;

describe("CPC calculator", () => {
  it("matches the hand-verified worked example: 500 ÷ 1250 = 0.40", () => {
    const results = compute({ adSpend: 500, clicks: 1250, conversionRate: 2 });

    expect(valueFor(results, "cpc")).toBeCloseTo(0.4, 10);
    expect(valueFor(results, "conversions")).toBeCloseTo(25, 10);
    expect(valueFor(results, "cpa")).toBeCloseTo(20, 10);
  });

  it("agrees with the CPA figure in the architecture appendix", () => {
    // Appendix A #6: 500 spend ÷ 25 conversions = $20.00. Reached here via a
    // conversion rate rather than a conversion count — the two must agree.
    const results = compute({ adSpend: 500, clicks: 1250, conversionRate: 2 });
    expect(valueFor(results, "cpa")).toBeCloseTo(500 / 25, 10);
  });

  it("returns null rather than Infinity when there are no clicks", () => {
    const results = compute({ adSpend: 500, clicks: 0, conversionRate: 2 });

    expect(valueFor(results, "cpc")).toBeNull();
    expect(resultFor(results, "cpc").note).toBeTruthy();
    expect(valueFor(results, "cpa")).toBeNull();
  });

  it("omits CPA when no conversion rate is supplied", () => {
    const results = compute({ adSpend: 500, clicks: 1250, conversionRate: 0 });

    expect(valueFor(results, "cpc")).toBeCloseTo(0.4, 10);
    expect(valueFor(results, "cpa")).toBeNull();
    expect(valueFor(results, "conversions")).toBeNull();
    expect(resultFor(results, "cpa").note).toContain("Add a conversion rate");
  });

  it("keeps precision on sub-cent click prices", () => {
    // 100 ÷ 2667 = 0.037495... Rounding this to 0.04 would overstate cost by 7%.
    const results = compute({ adSpend: 100, clicks: 2667, conversionRate: 0 });
    expect(valueFor(results, "cpc")).toBeCloseTo(0.03749531, 6);
  });

  it("halving click price and doubling conversion rate move CPA identically", () => {
    const cheaperClicks = compute({ adSpend: 250, clicks: 1250, conversionRate: 2 });
    const betterConversion = compute({ adSpend: 500, clicks: 1250, conversionRate: 4 });

    expect(valueFor(cheaperClicks, "cpa")).toBeCloseTo(10, 10);
    expect(valueFor(betterConversion, "cpa")).toBeCloseTo(10, 10);
  });

  it("handles a 100% conversion rate without error", () => {
    const results = compute({ adSpend: 500, clicks: 1250, conversionRate: 100 });

    expect(valueFor(results, "conversions")).toBeCloseTo(1250, 10);
    expect(valueFor(results, "cpa")).toBeCloseTo(0.4, 10);
  });
});
