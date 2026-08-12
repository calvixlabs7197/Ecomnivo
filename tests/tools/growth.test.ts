import { describe, expect, it } from "vitest";
import { conversionRateEngine } from "@/lib/tools/engines/conversion-rate-calculator";
import { aovEngine } from "@/lib/tools/engines/aov-calculator";
import { revenueEngine } from "@/lib/tools/engines/revenue-calculator";
import { ltvEngine } from "@/lib/tools/engines/ltv-calculator";
import { resultFor, valueFor } from "./helpers";

describe("Conversion rate calculator", () => {
  it("matches Appendix A #19: (450 ÷ 25,000) × 100 = 1.80%", () => {
    const results = conversionRateEngine.compute({
      sessions: 25000,
      conversions: 450,
      targetRate: 2.5,
    });

    expect(valueFor(results, "conversionRate")).toBeCloseTo(1.8, 10);
  });

  it("works out the orders a target rate would produce", () => {
    const results = conversionRateEngine.compute({
      sessions: 25000,
      conversions: 450,
      targetRate: 2.5,
    });

    expect(valueFor(results, "conversionsAtTarget")).toBeCloseTo(625, 10);
    expect(valueFor(results, "additionalConversions")).toBeCloseTo(175, 10);
  });

  it("returns null rather than dividing by zero sessions", () => {
    const results = conversionRateEngine.compute({
      sessions: 0,
      conversions: 10,
      targetRate: 0,
    });

    expect(valueFor(results, "conversionRate")).toBeNull();
    expect(resultFor(results, "conversionRate").note).toBeTruthy();
  });

  it("allows a 100% rate", () => {
    const results = conversionRateEngine.compute({
      sessions: 500,
      conversions: 500,
      targetRate: 0,
    });

    expect(valueFor(results, "conversionRate")).toBeCloseTo(100, 10);
  });
});

describe("AOV calculator", () => {
  it("matches Appendix A #20: 45,000 ÷ 600 = 75.00", () => {
    const results = aovEngine.compute({ revenue: 45000, orders: 600, targetAov: 85 });
    expect(valueFor(results, "aov")).toBeCloseTo(75, 10);
  });

  it("works out the revenue a higher average would produce", () => {
    const results = aovEngine.compute({ revenue: 45000, orders: 600, targetAov: 85 });

    expect(valueFor(results, "revenueAtTarget")).toBeCloseTo(51000, 10);
    expect(valueFor(results, "additionalRevenue")).toBeCloseTo(6000, 10);
  });

  it("returns null rather than Infinity with no orders", () => {
    const results = aovEngine.compute({ revenue: 45000, orders: 0, targetAov: 0 });
    expect(valueFor(results, "aov")).toBeNull();
  });

  it("omits target figures when none is supplied", () => {
    const results = aovEngine.compute({ revenue: 45000, orders: 600, targetAov: 0 });
    expect(valueFor(results, "revenueAtTarget")).toBeNull();
  });
});

describe("Revenue calculator", () => {
  it("matches Appendix A #21: 25,000 × 1.8% × 75 = 33,750", () => {
    const results = revenueEngine.compute({
      sessions: 25000,
      conversionRate: 1.8,
      averageOrderValue: 75,
    });

    expect(valueFor(results, "orders")).toBeCloseTo(450, 10);
    expect(valueFor(results, "revenue")).toBeCloseTo(33750, 10);
    expect(valueFor(results, "revenuePerSession")).toBeCloseTo(1.35, 10);
  });

  it("agrees with the conversion rate and AOV calculators on the same figures", () => {
    const revenue = revenueEngine.compute({
      sessions: 25000,
      conversionRate: 1.8,
      averageOrderValue: 75,
    });
    const cvr = conversionRateEngine.compute({
      sessions: 25000,
      conversions: 450,
      targetRate: 0,
    });
    const aov = aovEngine.compute({ revenue: 33750, orders: 450, targetAov: 0 });

    expect(valueFor(cvr, "conversionRate")).toBeCloseTo(1.8, 10);
    expect(valueFor(aov, "aov")).toBeCloseTo(75, 10);
    expect(valueFor(revenue, "revenue")).toBeCloseTo(33750, 10);
  });

  it("compounds: 10% on each lever gives a third more revenue", () => {
    const base = revenueEngine.compute({
      sessions: 25000,
      conversionRate: 1.8,
      averageOrderValue: 75,
    });
    const improved = revenueEngine.compute({
      sessions: 27500,
      conversionRate: 1.98,
      averageOrderValue: 82.5,
    });

    const ratio = (valueFor(improved, "revenue") ?? 0) / (valueFor(base, "revenue") ?? 1);
    expect(ratio).toBeCloseTo(1.331, 6);
  });

  it("returns null for revenue per session with no sessions", () => {
    const results = revenueEngine.compute({
      sessions: 0,
      conversionRate: 1.8,
      averageOrderValue: 75,
    });

    expect(valueFor(results, "revenue")).toBe(0);
    expect(valueFor(results, "revenuePerSession")).toBeNull();
  });
});

describe("Customer LTV calculator", () => {
  const base = {
    averageOrderValue: 75,
    purchaseFrequency: 3,
    lifespanYears: 2,
    grossMargin: 45,
    cac: 50,
  };

  it("matches Appendix A #22: 75 × 3 × 2 × 0.45 = 202.50", () => {
    const results = ltvEngine.compute(base);

    expect(valueFor(results, "ordersPerCustomer")).toBeCloseTo(6, 10);
    expect(valueFor(results, "revenuePerCustomer")).toBeCloseTo(450, 10);
    expect(valueFor(results, "ltv")).toBeCloseTo(202.5, 10);
  });

  it("matches Appendix A #22's ratio: 202.50 ÷ 50 = 4.05x", () => {
    const results = ltvEngine.compute(base);

    expect(valueFor(results, "ltvToCac")).toBeCloseTo(4.05, 10);
    expect(resultFor(results, "ltvToCac").tone).toBe("positive");
  });

  it("is margin-adjusted — LTV is well below lifetime revenue", () => {
    const results = ltvEngine.compute(base);
    const ltv = valueFor(results, "ltv") ?? 0;
    const revenue = valueFor(results, "revenuePerCustomer") ?? 0;

    expect(ltv).toBeLessThan(revenue);
    expect(ltv).toBeCloseTo(revenue * 0.45, 8);
  });

  it("agrees with the CAC calculator's ratio on the same figures", () => {
    const results = ltvEngine.compute(base);
    expect(valueFor(results, "ltvToCac")).toBeCloseTo(4.05, 10);
  });

  it("marks a ratio below 3 as negative", () => {
    const results = ltvEngine.compute({ ...base, cac: 100 });

    expect(valueFor(results, "ltvToCac")).toBeCloseTo(2.025, 10);
    expect(resultFor(results, "ltvToCac").tone).toBe("negative");
  });

  it("returns null for the ratio when no CAC is supplied", () => {
    const results = ltvEngine.compute({ ...base, cac: 0 });

    expect(valueFor(results, "ltv")).toBeCloseTo(202.5, 10);
    expect(valueFor(results, "ltvToCac")).toBeNull();
  });

  it("returns zero LTV at a zero margin, not the revenue figure", () => {
    const results = ltvEngine.compute({ ...base, grossMargin: 0 });
    expect(valueFor(results, "ltv")).toBe(0);
  });
});
