import { describe, expect, it } from "vitest";
import { roasEngine } from "@/lib/tools/engines/roas-calculator";
import { resultFor, valueFor } from "./helpers";

const compute = roasEngine.compute;

describe("ROAS calculator", () => {
  it("matches the hand-verified worked example: 8000 ÷ 2000 = 4.00x", () => {
    const results = compute({ revenue: 8000, adSpend: 2000 });

    expect(valueFor(results, "roas")).toBeCloseTo(4, 10);
    expect(valueFor(results, "roasPercent")).toBeCloseTo(400, 10);
    expect(valueFor(results, "revenueAfterAdSpend")).toBeCloseTo(6000, 10);
  });

  it("returns null rather than Infinity when ad spend is zero", () => {
    const results = compute({ revenue: 8000, adSpend: 0 });

    expect(valueFor(results, "roas")).toBeNull();
    expect(valueFor(results, "roasPercent")).toBeNull();
    // A null result must always explain itself.
    expect(resultFor(results, "roas").note).toBeTruthy();
  });

  it("returns null rather than NaN when both revenue and spend are zero", () => {
    const results = compute({ revenue: 0, adSpend: 0 });
    expect(valueFor(results, "roas")).toBeNull();
  });

  it("handles a campaign that spent more than it returned", () => {
    const results = compute({ revenue: 500, adSpend: 2000 });

    expect(valueFor(results, "roas")).toBeCloseTo(0.25, 10);
    expect(valueFor(results, "revenueAfterAdSpend")).toBeCloseTo(-1500, 10);
    expect(resultFor(results, "revenueAfterAdSpend").tone).toBe("negative");
  });

  it("marks revenue after ad spend as positive at exactly break-even", () => {
    const results = compute({ revenue: 2000, adSpend: 2000 });

    expect(valueFor(results, "roas")).toBeCloseTo(1, 10);
    expect(valueFor(results, "revenueAfterAdSpend")).toBe(0);
    expect(resultFor(results, "revenueAfterAdSpend").tone).toBe("positive");
  });

  it("does not claim profitability — ROAS carries no tone", () => {
    // ROAS above 1 is not profit; whether it is good depends on a margin this
    // tool does not know. Colouring it green would be a lie.
    const results = compute({ revenue: 8000, adSpend: 2000 });
    expect(resultFor(results, "roas").tone).toBeUndefined();
  });
});
