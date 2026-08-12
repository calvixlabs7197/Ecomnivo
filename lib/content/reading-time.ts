/**
 * Estimated reading time in whole minutes, never less than one.
 *
 * 200 words per minute is the conventional figure for online prose. It is an
 * estimate and presented as one — the point is to set expectations before
 * someone commits to a page, not to be accurate to the second.
 */
export function readingMinutes(markdown: string): number {
  const words = markdown
    // Strip code fences, links' URLs and Markdown punctuation so they do not
    // inflate the count.
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
}
