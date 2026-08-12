/**
 * Reading the filter state back out of the URL.
 *
 * `searchParams` hands over `string | string[] | undefined`, because a URL can
 * legitimately carry `?status=a&status=b`. Every filter in the admin is
 * single-valued, so the first value wins and the rest are ignored rather than
 * throwing — a hand-edited URL should narrow a list, never break a screen.
 */
export type ParamValue = string | string[] | undefined;

export function firstParam(value: ParamValue): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

/**
 * Case-insensitive substring match across several fields.
 *
 * Substring, not fuzzy: these lists are tens of rows long, the person typing
 * usually knows what they are looking for, and a fuzzy match that surfaces
 * three unrelated rows costs more than it saves.
 */
export function matchesQuery(query: string, ...fields: Array<string | undefined>): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

/** "3 of 22 guides", or just "22 guides" when nothing is filtered. */
export function resultLabel(shown: number, total: number, noun: string): string {
  const plural = total === 1 ? noun : `${noun}s`;
  return shown === total ? `${total} ${plural}` : `${shown} of ${total} ${plural}`;
}
