import { describe, expect, it } from "vitest";
import { shopifyProfitEngine } from "@/lib/tools/engines/shopify-profit-calculator";
import { productProfitEngine } from "@/lib/tools/engines/product-profit-calculator";
import { grossProfitEngine } from "@/lib/tools/engines/gross-profit-calculator";
import { netProfitEngine } from "@/lib/tools/engines/net-profit-calculator";
import { resultFor, valueFor } from "./helpers";

describe("Shopify profit calculator", () => {
  const base = {
    revenue: 10000,
    orders: 200,
    cogs: 4000,
    paymentRate: 2.9,
    paymentFixedFee: 0.3,
    planCost: 39,
    appCosts: 100,
    shipping: 0,
    adSpend: 0,
  };

  it("matches the corrected Appendix A #10: 5,511, not 5,461", () => {
    // Payment fees = 0.029 x 10,000 (290) + 0.30 x 200 (60) = 350.
    // 10,000 - 4,000 - 350 - 39 - 100 = 5,511.
    // The architecture document originally stated 5,461; that was a 50 error,
    // caught by deriving this by hand before writing the engine.
    const results = shopifyProfitEngine.compute(base);

    expect(valueFor(results, "paymentFees")).toBeCloseTo(350, 10);
    expect(valueFor(results, "netProfit")).toBeCloseTo(5511, 10);
  });

  it("charges both a percentage and a flat fee per order", () => {
    const withoutFixedFee = shopifyProfitEngine.compute({ ...base, paymentFixedFee: 0 });
    expect(valueFor(withoutFixedFee, "paymentFees")).toBeCloseTo(290, 10);

    const withoutRate = shopifyProfitEngine.compute({ ...base, paymentRate: 0 });
    expect(valueFor(withoutRate, "paymentFees")).toBeCloseTo(60, 10);
  });

  it("shows an effective fee rate above the headline rate", () => {
    // 350 of fees on 10,000 of revenue is 3.5%, not the headline 2.9%.
    const results = shopifyProfitEngine.compute(base);
    const share = valueFor(results, "feesAsShare") ?? 0;

    expect(share).toBeCloseTo(3.5, 10);
    expect(share).toBeGreaterThan(base.paymentRate);
  });

  it("punishes a low average order value through the flat fee", () => {
    // Same revenue, four times the orders -> four times the flat fees.
    const results = shopifyProfitEngine.compute({ ...base, orders: 800 });
    expect(valueFor(results, "paymentFees")).toBeCloseTo(290 + 240, 10);
    expect(valueFor(results, "feesAsShare")).toBeCloseTo(5.3, 10);
  });

  it("returns null for margin rather than dividing by zero revenue", () => {
    const results = shopifyProfitEngine.compute({ ...base, revenue: 0 });
    expect(valueFor(results, "netMargin")).toBeNull();
    expect(resultFor(results, "netMargin").note).toBeTruthy();
  });
});

describe("Product profit calculator", () => {
  it("matches Appendix A #11: 49.99 − (18 + 4.50 + 1.75) = 25.74", () => {
    const results = productProfitEngine.compute({
      price: 49.99,
      unitCost: 18,
      shippingCost: 4.5,
      otherFees: 1.75,
      unitsSold: 100,
    });

    expect(valueFor(results, "costPerUnit")).toBeCloseTo(24.25, 10);
    expect(valueFor(results, "profitPerUnit")).toBeCloseTo(25.74, 10);
    expect(valueFor(results, "margin")).toBeCloseTo(51.4903, 3);
    expect(valueFor(results, "totalProfit")).toBeCloseTo(2574, 8);
  });

  it("keeps markup above margin", () => {
    const results = productProfitEngine.compute({
      price: 49.99,
      unitCost: 18,
      shippingCost: 4.5,
      otherFees: 1.75,
      unitsSold: 0,
    });

    const margin = valueFor(results, "margin") ?? 0;
    const markup = valueFor(results, "markup") ?? 0;
    expect(markup).toBeGreaterThan(margin);
    expect(markup).toBeCloseTo(106.144, 2);
  });

  it("reports a loss when costs exceed the price", () => {
    const results = productProfitEngine.compute({
      price: 20,
      unitCost: 18,
      shippingCost: 4.5,
      otherFees: 1.75,
      unitsSold: 10,
    });

    expect(valueFor(results, "profitPerUnit")).toBeCloseTo(-4.25, 10);
    expect(resultFor(results, "profitPerUnit").tone).toBe("negative");
    expect(valueFor(results, "totalProfit")).toBeCloseTo(-42.5, 10);
  });

  it("omits the total when no unit count is given", () => {
    const results = productProfitEngine.compute({
      price: 49.99,
      unitCost: 18,
      shippingCost: 0,
      otherFees: 0,
      unitsSold: 0,
    });

    expect(valueFor(results, "totalProfit")).toBeNull();
  });
});

describe("Gross profit calculator", () => {
  it("matches Appendix A #13: 100,000 − 62,000 = 38,000 at 38%", () => {
    const results = grossProfitEngine.compute({ revenue: 100000, cogs: 62000 });

    expect(valueFor(results, "grossProfit")).toBeCloseTo(38000, 10);
    expect(valueFor(results, "grossMargin")).toBeCloseTo(38, 10);
    expect(valueFor(results, "cogsShare")).toBeCloseTo(62, 10);
  });

  it("keeps margin and cost share summing to 100", () => {
    const results = grossProfitEngine.compute({ revenue: 80000, cogs: 47000 });
    const margin = valueFor(results, "grossMargin") ?? 0;
    const share = valueFor(results, "cogsShare") ?? 0;
    expect(margin + share).toBeCloseTo(100, 8);
  });

  it("returns null for margin at zero revenue", () => {
    const results = grossProfitEngine.compute({ revenue: 0, cogs: 62000 });
    expect(valueFor(results, "grossMargin")).toBeNull();
    expect(valueFor(results, "grossProfit")).toBeCloseTo(-62000, 10);
  });
});

describe("Net profit calculator", () => {
  const base = { revenue: 100000, cogs: 62000, operatingExpenses: 21000, otherExpenses: 5000 };

  it("matches Appendix A #14: 100,000 − (62,000 + 21,000 + 5,000) = 12,000 at 12%", () => {
    const results = netProfitEngine.compute(base);

    expect(valueFor(results, "totalExpenses")).toBeCloseTo(88000, 10);
    expect(valueFor(results, "netProfit")).toBeCloseTo(12000, 10);
    expect(valueFor(results, "netMargin")).toBeCloseTo(12, 10);
  });

  it("agrees with the gross profit calculator on the same figures", () => {
    const net = netProfitEngine.compute(base);
    const gross = grossProfitEngine.compute({ revenue: base.revenue, cogs: base.cogs });

    expect(valueFor(net, "grossProfit")).toBeCloseTo(valueFor(gross, "grossProfit") ?? 0, 10);
    expect(valueFor(net, "grossMargin")).toBeCloseTo(valueFor(gross, "grossMargin") ?? 0, 10);
  });

  it("keeps net profit below gross profit whenever expenses exist", () => {
    const results = netProfitEngine.compute(base);
    expect(valueFor(results, "netProfit") ?? 0).toBeLessThan(valueFor(results, "grossProfit") ?? 0);
  });

  it("reports a loss with a negative tone", () => {
    const results = netProfitEngine.compute({ ...base, revenue: 80000 });

    expect(valueFor(results, "netProfit")).toBeCloseTo(-8000, 10);
    expect(resultFor(results, "netProfit").tone).toBe("negative");
  });

  it("treats omitted other expenses as zero", () => {
    const results = netProfitEngine.compute({ ...base, otherExpenses: 0 });
    expect(valueFor(results, "netProfit")).toBeCloseTo(17000, 10);
  });
});
