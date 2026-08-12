/**
 * The SEO rules, as a pure function.
 *
 * Deliberately free of any data source so it can be unit-tested with a literal
 * array — the checks are the part that has to be right, and they are worth
 * more tested than the plumbing that feeds them.
 *
 * Every threshold below is a display limit, not a ranking factor. Google
 * truncates a title around 60 characters and a description around 160; writing
 * past that does no harm to rankings, it just means the reader never sees the
 * end of the sentence. The audit says so in those terms, because an admin who
 * is told "this is bad for SEO" learns nothing they can act on.
 */

export const TITLE_MAX = 65;
export const TITLE_MIN = 15;
export const DESCRIPTION_MAX = 165;
export const DESCRIPTION_MIN = 70;
/** Below this, a page is thin enough that a crawler may treat it as filler. */
export const THIN_WORD_COUNT = 300;

export type SeoEntity = "tool" | "guide" | "page" | "category";
export type IssueSeverity = "critical" | "warning" | "notice";

export interface SeoSubject {
  entity: SeoEntity;
  slug: string;
  /** Display name in the report. */
  name: string;
  /** Public path, or null when the subject is not currently reachable. */
  publicPath: string | null;
  /** The effective <title>, after every fallback the route applies. */
  title: string;
  /** The effective meta description, after fallbacks. Empty means there is none. */
  description: string;
  indexable: boolean;
  published: boolean;
  /** Body word count, where the subject has a body. */
  words?: number;
}

export interface SeoIssue {
  id: string;
  severity: IssueSeverity;
  entity: SeoEntity;
  slug: string;
  name: string;
  /** What is wrong, in one sentence. */
  problem: string;
  /** What to do about it. */
  fix: string;
}

const severityRank: Record<IssueSeverity, number> = {
  critical: 0,
  warning: 1,
  notice: 2,
};

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Slugs that share a title or description with at least one other subject. */
function duplicatesOf(
  subjects: readonly SeoSubject[],
  pick: (subject: SeoSubject) => string,
): Map<string, SeoSubject[]> {
  const groups = new Map<string, SeoSubject[]>();

  for (const subject of subjects) {
    // Only indexable subjects can compete with each other in an index.
    if (!subject.indexable || !subject.published) continue;
    const key = normalise(pick(subject));
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), subject]);
  }

  return new Map([...groups].filter(([, group]) => group.length > 1));
}

export function auditSubjects(subjects: readonly SeoSubject[]): SeoIssue[] {
  const issues: SeoIssue[] = [];

  const add = (
    subject: SeoSubject,
    id: string,
    severity: IssueSeverity,
    problem: string,
    fix: string,
  ) =>
    issues.push({
      id: `${subject.entity}:${subject.slug}:${id}`,
      severity,
      entity: subject.entity,
      slug: subject.slug,
      name: subject.name,
      problem,
      fix,
    });

  for (const subject of subjects) {
    // An unpublished subject is not in anyone's index, so its copy is not yet
    // a problem. Reporting it would bury the live issues under drafts.
    if (!subject.published) continue;

    const title = subject.title.trim();
    const description = subject.description.trim();

    if (!title) {
      add(
        subject,
        "title-missing",
        "critical",
        "No title.",
        "Give it a title — this is what shows as the blue link in results.",
      );
    } else if (title.length > TITLE_MAX) {
      add(
        subject,
        "title-long",
        "warning",
        `Title is ${title.length} characters.`,
        `Trim to ${TITLE_MAX} or fewer, or the end is cut off in results.`,
      );
    } else if (title.length < TITLE_MIN) {
      add(
        subject,
        "title-short",
        "notice",
        `Title is only ${title.length} characters.`,
        "A fuller title gives the reader more reason to click.",
      );
    }

    if (!description) {
      add(
        subject,
        "description-missing",
        "critical",
        "No meta description.",
        "Write one. Without it, search engines invent a snippet from the page body.",
      );
    } else if (description.length > DESCRIPTION_MAX) {
      add(
        subject,
        "description-long",
        "warning",
        `Description is ${description.length} characters.`,
        `Trim to ${DESCRIPTION_MAX} or fewer so the sentence finishes on screen.`,
      );
    } else if (description.length < DESCRIPTION_MIN) {
      add(
        subject,
        "description-short",
        "notice",
        `Description is only ${description.length} characters.`,
        `Around ${DESCRIPTION_MIN}–${DESCRIPTION_MAX} characters uses the space available.`,
      );
    }

    if (subject.words !== undefined && subject.words < THIN_WORD_COUNT && subject.indexable) {
      add(
        subject,
        "thin",
        "warning",
        `Body is ${subject.words} words.`,
        `Under ${THIN_WORD_COUNT} words reads as thin content. Expand it, or mark it non-indexable.`,
      );
    }

    if (!subject.indexable) {
      add(
        subject,
        "noindex",
        "notice",
        "Published, but excluded from search engines.",
        "Intentional for thank-you and duplicate pages. If not, tick the indexing box.",
      );
    }
  }

  for (const [, group] of duplicatesOf(subjects, (subject) => subject.title)) {
    for (const subject of group) {
      const others = group.filter((candidate) => candidate !== subject);
      add(
        subject,
        "title-duplicate",
        "warning",
        `Shares its title with ${others.map((other) => other.slug).join(", ")}.`,
        "Two pages competing on one title split their own ranking. Make each specific.",
      );
    }
  }

  for (const [, group] of duplicatesOf(subjects, (subject) => subject.description)) {
    for (const subject of group) {
      const others = group.filter((candidate) => candidate !== subject);
      add(
        subject,
        "description-duplicate",
        "warning",
        `Shares its meta description with ${others.map((other) => other.slug).join(", ")}.`,
        "Describe what is different about each page.",
      );
    }
  }

  return issues.sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      a.entity.localeCompare(b.entity) ||
      a.slug.localeCompare(b.slug),
  );
}

export interface SeoSummary {
  subjects: number;
  /** Published subjects with no critical or warning issue against them. */
  clean: number;
  critical: number;
  warning: number;
  notice: number;
  /** Percentage of audited subjects that are clean. 100 when there is nothing to audit. */
  score: number;
}

export function summariseIssues(
  subjects: readonly SeoSubject[],
  issues: readonly SeoIssue[],
): SeoSummary {
  const audited = subjects.filter((subject) => subject.published);
  const flagged = new Set(
    issues
      .filter((issue) => issue.severity !== "notice")
      .map((issue) => `${issue.entity}:${issue.slug}`),
  );

  const clean = audited.filter(
    (subject) => !flagged.has(`${subject.entity}:${subject.slug}`),
  ).length;

  return {
    subjects: audited.length,
    clean,
    critical: issues.filter((issue) => issue.severity === "critical").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    notice: issues.filter((issue) => issue.severity === "notice").length,
    score: audited.length === 0 ? 100 : Math.round((clean / audited.length) * 100),
  };
}

/** Words in a markdown body, ignoring code fences and link syntax. */
export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ");

  return text.split(/\s+/).filter(Boolean).length;
}
