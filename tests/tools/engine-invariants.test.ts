import { describe, expect, it } from "vitest";
import { getAllToolEngines } from "@/lib/tools/engines";
import type { ToolEngine, ToolInput } from "@/lib/tools/types";

/**
 * Rules every calculator must obey, checked against every engine.
 *
 * The value of these tests grows as tools are added: a new calculator gets
 * this coverage for free, so the twenty-second tool cannot reintroduce the
 * NaN bug the first one was written to avoid.
 */
const engines = getAllToolEngines();

/**
 * Inputs chosen to break things: zero denominators, negatives that the UI
 * blocks but `compute` must still survive, sub-cent values, and figures large
 * enough to lose float precision.
 */
const adversarialValues = [0, 1, -1, -1000, 0.5, 0.000001, 1e9, 12345.678];

function baseline(engine: ToolEngine<ToolInput>): ToolInput {
  return Object.fromEntries(
    engine.fields.map((field) => [field.name, field.defaultValue ?? 1]),
  );
}

/** One field varied at a time, rather than a full cartesian product. */
function adversarialInputs(engine: ToolEngine<ToolInput>): ToolInput[] {
  const base = baseline(engine);
  const cases: ToolInput[] = [base, Object.fromEntries(engine.fields.map((f) => [f.name, 0]))];

  for (const field of engine.fields) {
    for (const value of adversarialValues) {
      cases.push({ ...base, [field.name]: value });
    }
  }

  return cases;
}

describe("engine invariants", () => {
  it("covers every engine", () => {
    expect(engines.length).toBeGreaterThan(0);
  });

  for (const engine of engines) {
    describe(engine.slug, () => {
      it("never returns NaN, Infinity or undefined", () => {
        for (const input of adversarialInputs(engine)) {
          for (const result of engine.compute(input)) {
            const ok = result.value === null || Number.isFinite(result.value);
            expect(
              ok,
              `${engine.slug}.${result.key} produced ${String(result.value)} for ${JSON.stringify(input)}`,
            ).toBe(true);
          }
        }
      });

      it("never throws, whatever it is given", () => {
        for (const input of adversarialInputs(engine)) {
          expect(() => engine.compute(input)).not.toThrow();
        }
      });

      it("explains itself whenever a value is null", () => {
        for (const input of adversarialInputs(engine)) {
          const results = engine.compute(input);
          const hasNull = results.some((result) => result.value === null);
          if (!hasNull) continue;

          const explains = results.some((result) => Boolean(result.note));
          expect(
            explains,
            `${engine.slug} returned a null with no note for ${JSON.stringify(input)}`,
          ).toBe(true);
        }
      });

      it("returns a stable set of result keys regardless of input", () => {
        // The results panel reserves space from the first render. If the shape
        // changed with the input, the layout would shift as you type.
        const shapes = adversarialInputs(engine).map((input) =>
          engine.compute(input).map((result) => result.key).join(","),
        );
        expect(new Set(shapes).size).toBe(1);
      });

      it("has unique field names and unique result keys", () => {
        const fieldNames = engine.fields.map((field) => field.name);
        expect(new Set(fieldNames).size).toBe(fieldNames.length);

        const keys = engine.compute(baseline(engine)).map((result) => result.key);
        expect(new Set(keys).size).toBe(keys.length);
      });

      it("has at most two primary results", () => {
        const primary = engine
          .compute(baseline(engine))
          .filter((result) => result.emphasis === "primary");
        expect(primary.length).toBeGreaterThan(0);
        expect(primary.length).toBeLessThanOrEqual(2);
      });

      it("is pure — the same input gives the same output, and inputs are not mutated", () => {
        const input = baseline(engine);
        const snapshot = JSON.stringify(input);

        const first = engine.compute(input);
        const second = engine.compute(input);

        expect(JSON.stringify(input)).toBe(snapshot);
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
      });

      it("labels every field and gives money and count fields a non-negative floor", () => {
        for (const field of engine.fields) {
          expect(field.label.length).toBeGreaterThan(0);
          if (field.kind === "currency" || field.kind === "integer") {
            // A floor must be declared and cannot allow negatives. Some counts
            // legitimately start at 1 rather than 0 — a period of zero days is
            // not a meaningful input.
            expect(field.min, `${engine.slug}.${field.name} min`).toBeDefined();
            expect(field.min ?? -1).toBeGreaterThanOrEqual(0);
          }
        }
      });
    });
  }
});
