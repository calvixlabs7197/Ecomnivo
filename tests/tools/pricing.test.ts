import { describe, expect, it } from "vitest";
import { markupEngine } from "@/lib/tools/engines/markup-calculator";
import { sellingPriceEngine } from "@/lib/tools/engines/selling-price-calculator";
import { discountEngine } from "@/lib/tools/engines/discount-calculator";
import { wholesalePriceEngine } from "@/lib/tools/engines/wholesale-price-calculator";
import { resultFor, valueFor } from "./helpers";

describe("Markup calculator", () => {
  it("matches Appendix A #15: ((75 − 50) ÷ 50) × 100 = 50%", () => {
    const results = markupEngine.compute({ cost: 50, sellingPrice: 75, targetMarkup: 100 });

    expect(valueFor(results, "markup")).toBeCloseTo(50, 10);
    expect(valueFor(results, "profit")).toBeCloseTo(25, 10);
  });

  it("shows that a 50% markup is a 33.3% margin", () => {
    const results = markupEngine.compute({ cost: 50, sellingPrice: 75, targetMarkup: 0 });
    expect(valueFor(results, "margin")).toBeCloseTo(33.3333333333, 8);
  });

  it("applies a target markup to produce a price", () => {
    const results = markupEngine.compute({ cost: 50, sellingPrice: 75, targetMarkup: 100 });
    expect(valueFor(results, "priceAtTarget")).toBeCloseTo(100, 10);
  });

  it("confirms keystone: a 100% markup is a 50% margin", () => {
    const results = markupEngine.compute({ cost: 50, sellingPrice: 100, targetMarkup: 0 });
    expect(valueFor(results, "markup")).toBeCloseTo(100, 10);
    expect(valueFor(results, "margin")).toBeCloseTo(50, 10);
  });

  it("returns null for markup at zero cost rather than Infinity", () => {
    const results = markupEngine.compute({ cost: 0, sellingPrice: 75, targetMarkup: 0 });
    expect(valueFor(results, "markup")).toBeNull();
    expect(resultFor(results, "markup").note).toBeTruthy();
  });

  it("reports a negative markup when sold below cost", () => {
    const results = markupEngine.compute({ cost: 50, sellingPrice: 40, targetMarkup: 0 });
    expect(valueFor(results, "markup")).toBeCloseTo(-20, 10);
    expect(resultFor(results, "markup").tone).toBe("negative");
  });
});

describe("Selling price calculator", () => {
  it("matches Appendix A #16: 50 ÷ (1 − 0.40) = 83.33", () => {
    const results = sellingPriceEngine.compute({
      cost: 50,
      additionalCosts: 0,
      targetMargin: 40,
    });

    expect(valueFor(results, "sellingPrice")).toBeCloseTo(83.3333333333, 8);
    expect(valueFor(results, "profit")).toBeCloseTo(33.3333333333, 8);
    expect(valueFor(results, "markup")).toBeCloseTo(66.6666666667, 8);
  });

  it("actually delivers the target margin it was asked for", () => {
    // The whole point of the tool: price back-check.
    for (const targetMargin of [10, 25, 40, 60, 80]) {
      const results = sellingPriceEngine.compute({
        cost: 50,
        additionalCosts: 0,
        targetMargin,
      });
      const price = valueFor(results, "sellingPrice") ?? 0;
      const realisedMargin = ((price - 50) / price) * 100;
      expect(realisedMargin).toBeCloseTo(targetMargin, 8);
    }
  });

  it("is not the same as adding the margin to the cost", () => {
    // Adding 40% to 50 gives 70 and a margin of only 28.57%.
    const naive = 50 * 1.4;
    const naiveMargin = ((naive - 50) / naive) * 100;

    expect(naive).toBeCloseTo(70, 10);
    expect(naiveMargin).toBeCloseTo(28.5714285714, 8);

    const results = sellingPriceEngine.compute({ cost: 50, additionalCosts: 0, targetMargin: 40 });
    expect(valueFor(results, "sellingPrice")).not.toBeCloseTo(naive, 2);
  });

  it("includes additional costs in the price", () => {
    const results = sellingPriceEngine.compute({
      cost: 50,
      additionalCosts: 10,
      targetMargin: 40,
    });

    expect(valueFor(results, "totalCost")).toBeCloseTo(60, 10);
    expect(valueFor(results, "sellingPrice")).toBeCloseTo(100, 10);
  });

  it("returns null for an unreachable margin of 100% or more", () => {
    const results = sellingPriceEngine.compute({
      cost: 50,
      additionalCosts: 0,
      targetMargin: 100,
    });

    expect(valueFor(results, "sellingPrice")).toBeNull();
    expect(resultFor(results, "sellingPrice").note).toContain("impossible");
  });
});

describe("Discount calculator", () => {
  it("matches Appendix A #17: 120 × (1 − 0.25) = 90, saving 30", () => {
    const results = discountEngine.compute({
      originalPrice: 120,
      discountPercent: 25,
      unitCost: 60,
    });

    expect(valueFor(results, "salePrice")).toBeCloseTo(90, 10);
    expect(valueFor(results, "saved")).toBeCloseTo(30, 10);
  });

  it("shows a 25% discount halving a 50% margin's profit", () => {
    const results = discountEngine.compute({
      originalPrice: 120,
      discountPercent: 25,
      unitCost: 60,
    });

    expect(valueFor(results, "marginBefore")).toBeCloseTo(50, 10);
    expect(valueFor(results, "marginAfter")).toBeCloseTo(33.3333333333, 8);
    expect(valueFor(results, "profitAfter")).toBeCloseTo(30, 10);
  });

  it("reports a negative margin when the discount goes below cost", () => {
    const results = discountEngine.compute({
      originalPrice: 120,
      discountPercent: 60,
      unitCost: 60,
    });

    expect(valueFor(results, "salePrice")).toBeCloseTo(48, 10);
    expect(valueFor(results, "profitAfter")).toBeCloseTo(-12, 10);
    expect(resultFor(results, "marginAfter").tone).toBe("negative");
  });

  it("handles a 100% discount without dividing by zero", () => {
    const results = discountEngine.compute({
      originalPrice: 120,
      discountPercent: 100,
      unitCost: 60,
    });

    expect(valueFor(results, "salePrice")).toBe(0);
    expect(valueFor(results, "marginAfter")).toBeNull();
  });

  it("omits margin figures when no cost is supplied", () => {
    const results = discountEngine.compute({
      originalPrice: 120,
      discountPercent: 25,
      unitCost: 0,
    });

    expect(valueFor(results, "salePrice")).toBeCloseTo(90, 10);
    expect(valueFor(results, "marginAfter")).toBeNull();
  });
});

describe("Wholesale pricing calculator", () => {
  it("matches Appendix A #18: 10 × 2 = 20, then × 2.5 = 50", () => {
    const results = wholesalePriceEngine.compute({
      unitCost: 10,
      wholesaleMarkup: 100,
      retailMarkup: 150,
    });

    expect(valueFor(results, "wholesalePrice")).toBeCloseTo(20, 10);
    expect(valueFor(results, "retailPrice")).toBeCloseTo(50, 10);
  });

  it("reports both sides' margins", () => {
    const results = wholesalePriceEngine.compute({
      unitCost: 10,
      wholesaleMarkup: 100,
      retailMarkup: 150,
    });

    expect(valueFor(results, "wholesaleMargin")).toBeCloseTo(50, 10);
    expect(valueFor(results, "wholesaleProfit")).toBeCloseTo(10, 10);
    expect(valueFor(results, "retailerMargin")).toBeCloseTo(60, 10);
  });

  it("returns the cost itself at a zero markup", () => {
    const results = wholesalePriceEngine.compute({
      unitCost: 10,
      wholesaleMarkup: 0,
      retailMarkup: 0,
    });

    expect(valueFor(results, "wholesalePrice")).toBeCloseTo(10, 10);
    expect(valueFor(results, "retailPrice")).toBeCloseTo(10, 10);
    expect(valueFor(results, "wholesaleMargin")).toBe(0);
  });

  it("returns null for margins at a zero cost and zero markup", () => {
    const results = wholesalePriceEngine.compute({
      unitCost: 0,
      wholesaleMarkup: 0,
      retailMarkup: 0,
    });

    expect(valueFor(results, "wholesaleMargin")).toBeNull();
    expect(valueFor(results, "retailerMargin")).toBeNull();
  });
});
