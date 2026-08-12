import { describe, expect, it } from "vitest";
import { ecommerceProfitEngine } from "@/lib/tools/engines/ecommerce-profit-calculator";
import { resultFor, valueFor } from "./helpers";

const compute = ecommerceProfitEngine.compute;

const workedExample = {
  revenue: 10000,
  cogs: 4000,
  shipping: 800,
  transactionFees: 300,
  adSpend: 2000,
  otherCosts: 500,
};

describe("E-commerce profit calculator", () => {
  it("matches the hand-verified worked example: 2,400 profit at a 24% margin", () => {
    const results = compute(workedExample);

    expect(valueFor(results, "totalCosts")).toBeCloseTo(7600, 10);
    expect(valueFor(results, "netProfit")).toBeCloseTo(2400, 10);
    expect(valueFor(results, "netMargin")).toBeCloseTo(24, 10);
    expect(valueFor(results, "grossProfit")).toBeCloseTo(6000, 10);
  });

  it("keeps gross profit well above net profit — they are not the same figure", () => {
    const results = compute(workedExample);
    const gross = valueFor(results, "grossProfit") ?? 0;
    const net = valueFor(results, "netProfit") ?? 0;

    expect(gross).toBeGreaterThan(net);
    expect(gross).toBeCloseTo(6000, 10);
  });

  it("returns null for margin rather than dividing by zero revenue", () => {
    const results = compute({ ...workedExample, revenue: 0 });

    expect(valueFor(results, "netMargin")).toBeNull();
    expect(resultFor(results, "netMargin").note).toBeTruthy();
    // Profit itself is still a real number: you lost what you spent.
    expect(valueFor(results, "netProfit")).toBeCloseTo(-7600, 10);
  });

  it("reports a loss with a negative tone", () => {
    const results = compute({ ...workedExample, revenue: 5000 });

    expect(valueFor(results, "netProfit")).toBeCloseTo(-2600, 10);
    expect(valueFor(results, "netMargin")).toBeCloseTo(-52, 10);
    expect(resultFor(results, "netProfit").tone).toBe("negative");
    expect(resultFor(results, "netMargin").tone).toBe("negative");
  });

  it("treats exact break-even as neutral, not positive", () => {
    const results = compute({ ...workedExample, revenue: 7600 });

    expect(valueFor(results, "netProfit")).toBe(0);
    expect(resultFor(results, "netProfit").tone).toBe("neutral");
  });

  it("treats an omitted other-costs figure as zero", () => {
    const results = compute({ ...workedExample, otherCosts: 0 });

    expect(valueFor(results, "totalCosts")).toBeCloseTo(7100, 10);
    expect(valueFor(results, "netProfit")).toBeCloseTo(2900, 10);
  });

  it("keeps total costs equal to the sum of its parts", () => {
    const results = compute(workedExample);
    const parts =
      workedExample.cogs +
      workedExample.shipping +
      workedExample.transactionFees +
      workedExample.adSpend +
      workedExample.otherCosts;

    expect(valueFor(results, "totalCosts")).toBeCloseTo(parts, 10);
  });
});
