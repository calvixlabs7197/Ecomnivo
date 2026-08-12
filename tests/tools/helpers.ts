import type { ToolResult } from "@/lib/tools/types";

/**
 * Pulls one result out by key, failing loudly if it is missing.
 *
 * A test that silently reads `undefined` and compares it to `undefined` passes
 * while proving nothing, which is worse than no test at all.
 */
export function resultFor(results: ToolResult[], key: string): ToolResult {
  const result = results.find((candidate) => candidate.key === key);
  if (!result) {
    throw new Error(
      `No result with key "${key}". Available: ${results.map((r) => r.key).join(", ")}`,
    );
  }
  return result;
}

export function valueFor(results: ToolResult[], key: string): number | null {
  return resultFor(results, key).value;
}
