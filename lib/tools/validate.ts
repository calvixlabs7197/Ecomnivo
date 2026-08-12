import { parseNumericInput } from "@/lib/tools/format";
import type { ToolField } from "@/lib/tools/types";

export interface FieldEvaluation {
  /** Parsed value, or null when the field is not yet usable. */
  value: number | null;
  /** Shown under the input. Present only when the visitor typed something wrong. */
  error?: string;
  /** Required and empty. Not an error — the calculator simply waits. */
  missing?: boolean;
}

/**
 * Evaluates one field's raw text.
 *
 * The important distinction: an **empty required field is not an error**. It
 * is someone part-way through typing, and shouting at them for it is the
 * single most irritating thing a calculator can do. Errors are reserved for
 * input that cannot be read or cannot be valid.
 *
 * An empty *optional* field means zero — "no other costs" is a real answer.
 */
export function evaluateField(field: ToolField, raw: string): FieldEvaluation {
  if (raw.trim() === "") {
    return field.optional ? { value: 0 } : { value: null, missing: true };
  }

  const parsed = parseNumericInput(raw);

  if (parsed === null) return field.optional ? { value: 0 } : { value: null, missing: true };
  if (Number.isNaN(parsed)) return { value: null, error: "Enter a number." };

  if (field.kind === "integer" && !Number.isInteger(parsed)) {
    return { value: null, error: "Use a whole number." };
  }

  if (field.min !== undefined && parsed < field.min) {
    return {
      value: null,
      error: field.min === 0 ? "This cannot be negative." : `Must be at least ${field.min}.`,
    };
  }

  if (field.max !== undefined && parsed > field.max) {
    return { value: null, error: `Must be ${field.max} or less.` };
  }

  return { value: parsed };
}

export interface FormEvaluation {
  /** Present only when every field is valid and no required field is empty. */
  input: Record<string, number> | null;
  errors: Record<string, string>;
  hasMissing: boolean;
}

export function evaluateForm(
  fields: ReadonlyArray<ToolField>,
  values: Record<string, string>,
): FormEvaluation {
  const input: Record<string, number> = {};
  const errors: Record<string, string> = {};
  let hasMissing = false;

  for (const field of fields) {
    const evaluation = evaluateField(field, values[field.name] ?? "");

    if (evaluation.error) {
      errors[field.name] = evaluation.error;
      continue;
    }

    if (evaluation.missing || evaluation.value === null) {
      hasMissing = true;
      continue;
    }

    input[field.name] = evaluation.value;
  }

  const isComplete = !hasMissing && Object.keys(errors).length === 0;

  return { input: isComplete ? input : null, errors, hasMissing };
}
