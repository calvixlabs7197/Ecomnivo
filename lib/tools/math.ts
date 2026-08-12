/**
 * The arithmetic every calculator shares.
 *
 * The whole point of this module is that nothing downstream ever sees NaN,
 * Infinity or -0. Those are the values that turn a calculator into a bug
 * report, and they all originate here.
 */

/**
 * Division that returns `null` instead of Infinity or NaN.
 *
 * A zero denominator is not an error — it is a perfectly ordinary state while
 * someone is still typing, and "—" is the honest answer for it.
 */
export function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator === 0) return null;

  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

/** `a / b` expressed as a percentage (50 means 50%), or null. */
export function percentOf(numerator: number, denominator: number): number | null {
  const ratio = safeDivide(numerator, denominator);
  return ratio === null ? null : ratio * 100;
}

/**
 * Guards a result that is only meaningful when some condition holds — e.g. a
 * break-even ROAS is undefined once gross profit hits zero.
 */
export function onlyWhen(condition: boolean, value: number | null): number | null {
  return condition ? value : null;
}

/**
 * Rounds for display only.
 *
 * Never used inside a calculation: rounding intermediate values is how a
 * profit figure ends up a few cents away from the sum of its parts.
 */
export function roundForDisplay(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  // Collapse -0 to 0 so a rounded-away negative never prints as "-$0.00".
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Sums a list, ignoring anything non-finite rather than propagating NaN. */
export function sum(values: ReadonlyArray<number>): number {
  return values.reduce((total, value) => (Number.isFinite(value) ? total + value : total), 0);
}
