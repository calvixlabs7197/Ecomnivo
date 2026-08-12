import { describe, expect, it } from "vitest";
import { cpmEngine } from "@/lib/tools/engines/cpm-calculator";
import { ctrEngine } from "@/lib/tools/engines/ctr-calculator";
import { cpaEngine } from "@/lib/tools/engines/cpa-calculator";
import { cacEngine } from "@/lib/tools/engines/cac-calculator";
import { adBudgetEngine } from "@/lib/tools/engines/ad-budget-calculator";
import { resultFor, valueFor } from "./helpers";

describe("CPM calculator", () => {
  it("matches Appendix A #4: (500 ÷ 100,000) × 1000 = 5.00", () => {
    const results = cpmEngine.compute({ adSpend: 500, impressions: 100000, clicks: 1250 });

    expect(valueFor(results, "cpm")).toBeCloseTo(5, 10);
    // Consistent with Appendix A #5 and #3 on the same figures.
    expect(valueFor(results, "ctr")).toBeCloseTo(1.25, 10);
    expect(valueFor(results, "cpc")).toBeCloseTo(0.4, 10);
  });

  it("returns null rather than Infinity with no impressions", () => {
    const results = cpmEngine.compute({ adSpend: 500, impressions: 0, clicks: 0 });
    expect(valueFor(results, "cpm")).toBeNull();
    expect(resultFor(results, "cpm").note).toBeTruthy();
  });

  it("omits click-derived figures when clicks are not supplied", () => {
    const results = cpmEngine.compute({ adSpend: 500, impressions: 100000, clicks: 0 });
    expect(valueFor(results, "cpm")).toBeCloseTo(5, 10);
    expect(valueFor(results, "ctr")).toBeNull();
    expect(valueFor(results, "cpc")).toBeNull();
  });

  it("is a cost per thousand, not per impression", () => {
    // The classic error is forgetting the x1000, which understates CPM 1000-fold.
    const results = cpmEngine.compute({ adSpend: 500, impressions: 100000, clicks: 0 });
    expect(valueFor(results, "cpm")).toBeGreaterThan(1);
  });
});

describe("CTR calculator", () => {
  it("matches Appendix A #5: (1250 ÷ 100,000) × 100 = 1.25%", () => {
    const results = ctrEngine.compute({ impressions: 100000, clicks: 1250, targetCtr: 2 });
    expect(valueFor(results, "ctr")).toBeCloseTo(1.25, 10);
  });

  it("works out the clicks a target rate would produce", () => {
    const results = ctrEngine.compute({ impressions: 100000, clicks: 1250, targetCtr: 2 });
    expect(valueFor(results, "clicksAtTarget")).toBeCloseTo(2000, 10);
    expect(valueFor(results, "additionalClicks")).toBeCloseTo(750, 10);
  });

  it("reports a negative shortfall when already ahead of target", () => {
    const results = ctrEngine.compute({ impressions: 100000, clicks: 2500, targetCtr: 2 });
    expect(valueFor(results, "additionalClicks")).toBeCloseTo(-500, 10);
    expect(resultFor(results, "additionalClicks").tone).toBe("positive");
  });

  it("returns null rather than dividing by zero impressions", () => {
    const results = ctrEngine.compute({ impressions: 0, clicks: 10, targetCtr: 0 });
    expect(valueFor(results, "ctr")).toBeNull();
  });

  it("allows a 100% rate without breaking", () => {
    const results = ctrEngine.compute({ impressions: 500, clicks: 500, targetCtr: 0 });
    expect(valueFor(results, "ctr")).toBeCloseTo(100, 10);
  });
});

describe("CPA calculator", () => {
  it("matches Appendix A #6: 500 ÷ 25 = 20.00", () => {
    const results = cpaEngine.compute({ adSpend: 500, conversions: 25, averageOrderValue: 80 });
    expect(valueFor(results, "cpa")).toBeCloseTo(20, 10);
  });

  it("derives ROAS from order value and agrees with the ROAS calculator", () => {
    // 25 orders x 80 = 2000 revenue against 500 spend = 4.00x
    const results = cpaEngine.compute({ adSpend: 500, conversions: 25, averageOrderValue: 80 });
    expect(valueFor(results, "roas")).toBeCloseTo(4, 10);
    expect(valueFor(results, "valueAfterAdCost")).toBeCloseTo(60, 10);
  });

  it("returns null rather than Infinity with no conversions", () => {
    const results = cpaEngine.compute({ adSpend: 500, conversions: 0, averageOrderValue: 80 });
    expect(valueFor(results, "cpa")).toBeNull();
    expect(resultFor(results, "cpa").note).toBeTruthy();
  });

  it("flags a negative when the ad cost exceeds the order value", () => {
    const results = cpaEngine.compute({ adSpend: 500, conversions: 5, averageOrderValue: 80 });
    expect(valueFor(results, "cpa")).toBeCloseTo(100, 10);
    expect(valueFor(results, "valueAfterAdCost")).toBeCloseTo(-20, 10);
    expect(resultFor(results, "valueAfterAdCost").tone).toBe("negative");
  });

  it("omits ROAS when no order value is supplied", () => {
    const results = cpaEngine.compute({ adSpend: 500, conversions: 25, averageOrderValue: 0 });
    expect(valueFor(results, "roas")).toBeNull();
  });
});

describe("CAC calculator", () => {
  it("matches Appendix A #7: (4000 + 6000) ÷ 200 = 50.00", () => {
    const results = cacEngine.compute({
      marketingCosts: 6000,
      salesCosts: 4000,
      newCustomers: 200,
      customerLifetimeValue: 0,
    });

    expect(valueFor(results, "totalSpend")).toBeCloseTo(10000, 10);
    expect(valueFor(results, "cac")).toBeCloseTo(50, 10);
  });

  it("matches Appendix A #22's ratio: 202.50 ÷ 50 = 4.05x", () => {
    const results = cacEngine.compute({
      marketingCosts: 6000,
      salesCosts: 4000,
      newCustomers: 200,
      customerLifetimeValue: 202.5,
    });

    expect(valueFor(results, "ltvToCac")).toBeCloseTo(4.05, 10);
    expect(resultFor(results, "ltvToCac").tone).toBe("positive");
  });

  it("marks a ratio below 3 as negative", () => {
    const results = cacEngine.compute({
      marketingCosts: 6000,
      salesCosts: 4000,
      newCustomers: 200,
      customerLifetimeValue: 100,
    });

    expect(valueFor(results, "ltvToCac")).toBeCloseTo(2, 10);
    expect(resultFor(results, "ltvToCac").tone).toBe("negative");
  });

  it("returns null rather than Infinity with no new customers", () => {
    const results = cacEngine.compute({
      marketingCosts: 6000,
      salesCosts: 4000,
      newCustomers: 0,
      customerLifetimeValue: 202.5,
    });

    expect(valueFor(results, "cac")).toBeNull();
    expect(valueFor(results, "ltvToCac")).toBeNull();
  });

  it("treats omitted sales costs as zero", () => {
    const results = cacEngine.compute({
      marketingCosts: 6000,
      salesCosts: 0,
      newCustomers: 200,
      customerLifetimeValue: 0,
    });

    expect(valueFor(results, "cac")).toBeCloseTo(30, 10);
  });
});

describe("Ad budget calculator", () => {
  it("matches Appendix A #8: 50,000 ÷ 4 = 12,500, and 416.67 a day", () => {
    const results = adBudgetEngine.compute({ revenueGoal: 50000, targetRoas: 4, days: 30 });

    expect(valueFor(results, "totalBudget")).toBeCloseTo(12500, 10);
    expect(valueFor(results, "dailyBudget")).toBeCloseTo(416.6666667, 6);
    expect(valueFor(results, "dailyRevenue")).toBeCloseTo(1666.6666667, 6);
  });

  it("needs a bigger budget at a lower ROAS", () => {
    const results = adBudgetEngine.compute({ revenueGoal: 50000, targetRoas: 3, days: 30 });
    expect(valueFor(results, "totalBudget")).toBeCloseTo(16666.6666667, 6);
  });

  it("returns null rather than Infinity at a zero target ROAS", () => {
    const results = adBudgetEngine.compute({ revenueGoal: 50000, targetRoas: 0, days: 30 });

    expect(valueFor(results, "totalBudget")).toBeNull();
    expect(valueFor(results, "dailyBudget")).toBeNull();
    expect(resultFor(results, "totalBudget").note).toBeTruthy();
  });

  it("returns null for daily figures over zero days", () => {
    const results = adBudgetEngine.compute({ revenueGoal: 50000, targetRoas: 4, days: 0 });

    expect(valueFor(results, "totalBudget")).toBeCloseTo(12500, 10);
    expect(valueFor(results, "dailyBudget")).toBeNull();
    expect(valueFor(results, "dailyRevenue")).toBeNull();
  });
});
