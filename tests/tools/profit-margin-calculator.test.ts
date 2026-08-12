import { describe, expect, it } from "vitest";
import { profitMarginEngine } from "@/lib/tools/engines/profit-margin-calculator";
import { resultFor, valueFor } from "./helpers";

const compute = profitMarginEngine.compute;

describe("Profit margin calculator", () => {
  it("matches the hand-verified worked example: 40% margin, 66.7% markup", () => {
    const results = compute({ revenue: 100, cost: 60 });

    expect(valueFor(results, "profit")).toBeCloseTo(40, 10);
    expect(valueFor(results, "margin")).toBeCloseTo(40, 10);
    expect(valueFor(results, "markup")).toBeCloseTo(66.6666666667, 8);
  });

  it("keeps markup strictly above margin whenever there is a profit", () => {
    // This is the distinction the whole tool exists to make.
    for (const [revenue, cost] of [
      [100, 60],
      [150, 100],
      [49.99, 18],
      [1000, 1],
    ] as Array<[number, number]>) {
      const results = compute({ revenue, cost });
      const margin = valueFor(results, "margin") ?? 0;
      const markup = valueFor(results, "markup") ?? 0;
      expect(markup).toBeGreaterThan(margin);
    }
  });

  it("confirms a 50% markup is a 33.3% margin, not 50%", () => {
    const results = compute({ revenue: 150, cost: 100 });

    expect(valueFor(results, "markup")).toBeCloseTo(50, 10);
    expect(valueFor(results, "margin")).toBeCloseTo(33.3333333333, 8);
  });

  it("confirms a 40% margin needs a price of cost ÷ 0.6", () => {
    // The FAQ claims 60 ÷ 0.60 = 100 gives a 40% margin. Prove it.
    const price = 60 / 0.6;
    const results = compute({ revenue: price, cost: 60 });

    expect(price).toBeCloseTo(100, 10);
    expect(valueFor(results, "margin")).toBeCloseTo(40, 10);
  });

  it("confirms the FAQ's counter-example: adding 40% to cost gives 28.6%", () => {
    const results = compute({ revenue: 60 * 1.4, cost: 60 });
    expect(valueFor(results, "margin")).toBeCloseTo(28.5714285714, 8);
  });

  it("returns null for margin at zero revenue rather than dividing by zero", () => {
    const results = compute({ revenue: 0, cost: 60 });

    expect(valueFor(results, "margin")).toBeNull();
    expect(resultFor(results, "margin").note).toBeTruthy();
    expect(valueFor(results, "profit")).toBeCloseTo(-60, 10);
  });

  it("returns null for markup at zero cost rather than Infinity", () => {
    const results = compute({ revenue: 100, cost: 0 });

    expect(valueFor(results, "markup")).toBeNull();
    expect(valueFor(results, "margin")).toBeCloseTo(100, 10);
    expect(resultFor(results, "markup").note).toContain("cost above zero");
  });

  it("reports a negative margin when cost exceeds revenue", () => {
    const results = compute({ revenue: 50, cost: 80 });

    expect(valueFor(results, "margin")).toBeCloseTo(-60, 10);
    expect(resultFor(results, "margin").tone).toBe("negative");
  });
});
