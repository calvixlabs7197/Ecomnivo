import { describe, expect, it } from "vitest";
import { breakEvenRoasEngine } from "@/lib/tools/engines/break-even-roas-calculator";
import { resultFor, valueFor } from "./helpers";

const compute = breakEvenRoasEngine.compute;

describe("Break-even ROAS calculator", () => {
  it("matches the hand-verified worked example: 40% margin needs 2.50x", () => {
    const results = compute({ price: 100, cogs: 55, variableCosts: 5 });

    expect(valueFor(results, "grossProfit")).toBeCloseTo(40, 10);
    expect(valueFor(results, "grossMargin")).toBeCloseTo(40, 10);
    expect(valueFor(results, "breakEvenRoas")).toBeCloseTo(2.5, 10);
  });

  it("is the reciprocal of gross margin across the range", () => {
    // 20% margin -> 5.00x, 50% -> 2.00x, 60% -> 1.667x, 80% -> 1.25x
    const cases: Array<[number, number]> = [
      [80, 5],
      [50, 2],
      [40, 1 / 0.6],
      [20, 1.25],
    ];

    for (const [cogs, expected] of cases) {
      const results = compute({ price: 100, cogs, variableCosts: 0 });
      expect(valueFor(results, "breakEvenRoas")).toBeCloseTo(expected, 8);
    }
  });

  it("returns null when costs exactly consume the price", () => {
    const results = compute({ price: 100, cogs: 95, variableCosts: 5 });

    expect(valueFor(results, "grossProfit")).toBe(0);
    expect(valueFor(results, "breakEvenRoas")).toBeNull();
    expect(resultFor(results, "breakEvenRoas").note).toContain("no gross profit");
  });

  it("returns null when costs exceed the price rather than a negative ROAS", () => {
    const results = compute({ price: 100, cogs: 120, variableCosts: 5 });

    expect(valueFor(results, "breakEvenRoas")).toBeNull();
    expect(valueFor(results, "grossProfit")).toBeCloseTo(-25, 10);
    expect(resultFor(results, "grossProfit").tone).toBe("negative");
  });

  it("returns null for both margin and break-even at a zero price", () => {
    const results = compute({ price: 0, cogs: 0, variableCosts: 0 });

    expect(valueFor(results, "grossMargin")).toBeNull();
    expect(valueFor(results, "breakEvenRoas")).toBeNull();
  });

  it("treats omitted variable costs as zero", () => {
    const results = compute({ price: 100, cogs: 60, variableCosts: 0 });
    expect(valueFor(results, "grossMargin")).toBeCloseTo(40, 10);
  });

  it("agrees with the markup-vs-margin distinction the copy warns about", () => {
    // Bought at 55, sold at 100: an 81.8% markup but a 45% margin.
    // Using the markup figure would give 1.22x instead of the correct 2.22x.
    const results = compute({ price: 100, cogs: 55, variableCosts: 0 });

    expect(valueFor(results, "grossMargin")).toBeCloseTo(45, 10);
    expect(valueFor(results, "breakEvenRoas")).toBeCloseTo(100 / 45, 10);
  });
});
