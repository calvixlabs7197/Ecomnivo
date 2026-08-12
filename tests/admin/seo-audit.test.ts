import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  TITLE_MAX,
  auditSubjects,
  countWords,
  summariseIssues,
  type SeoSubject,
} from "@/lib/seo/audit";

/**
 * The audit is the one piece of admin logic that makes a judgement rather than
 * reporting a fact, so it is the piece worth testing: a false "critical" in
 * this report costs an editor an hour looking for a problem that is not there.
 */

function subject(overrides: Partial<SeoSubject> = {}): SeoSubject {
  return {
    entity: "guide",
    slug: "a-guide",
    name: "A guide",
    publicPath: "/guides/a-guide",
    title: "A perfectly reasonable title for a guide",
    description: "x".repeat(DESCRIPTION_MIN + 10),
    indexable: true,
    published: true,
    ...overrides,
  };
}

const idsFor = (subjects: SeoSubject[]) =>
  auditSubjects(subjects).map((issue) => issue.id.split(":").at(-1));

describe("auditSubjects", () => {
  it("passes a well-formed subject with no findings", () => {
    expect(auditSubjects([subject()])).toEqual([]);
  });

  it("flags a missing title and description as critical", () => {
    const issues = auditSubjects([subject({ title: "  ", description: "" })]);

    expect(issues).toHaveLength(2);
    expect(issues.every((issue) => issue.severity === "critical")).toBe(true);
  });

  it("flags a title past the display limit, and only past it", () => {
    expect(idsFor([subject({ title: "t".repeat(TITLE_MAX) })])).not.toContain("title-long");
    expect(idsFor([subject({ title: "t".repeat(TITLE_MAX + 1) })])).toContain("title-long");
  });

  it("flags a description past the display limit, and only past it", () => {
    expect(idsFor([subject({ description: "d".repeat(DESCRIPTION_MAX) })])).not.toContain(
      "description-long",
    );
    expect(idsFor([subject({ description: "d".repeat(DESCRIPTION_MAX + 1) })])).toContain(
      "description-long",
    );
  });

  it("says nothing about unpublished subjects", () => {
    expect(auditSubjects([subject({ published: false, title: "", description: "" })])).toEqual(
      [],
    );
  });

  it("reports thin bodies, but not on subjects excluded from search engines", () => {
    expect(idsFor([subject({ words: 120 })])).toContain("thin");
    expect(idsFor([subject({ words: 120, indexable: false })])).not.toContain("thin");
  });

  it("reports a noindex page as a notice rather than a problem", () => {
    const issues = auditSubjects([subject({ indexable: false })]);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe("notice");
  });

  it("flags both sides of a duplicate title", () => {
    const issues = auditSubjects([
      subject({ slug: "one" }),
      subject({ slug: "two", description: "y".repeat(DESCRIPTION_MIN + 10) }),
    ]);

    expect(issues.filter((issue) => issue.id.endsWith("title-duplicate"))).toHaveLength(2);
  });

  it("does not count an unpublished twin as a duplicate", () => {
    const issues = auditSubjects([
      subject({ slug: "one" }),
      subject({ slug: "two", published: false }),
    ]);

    expect(issues.some((issue) => issue.id.endsWith("title-duplicate"))).toBe(false);
  });

  it("sorts critical findings above warnings and notices", () => {
    const issues = auditSubjects([
      subject({ slug: "noisy", indexable: false }),
      subject({ slug: "broken", title: "", description: "" }),
    ]);

    expect(issues[0]?.severity).toBe("critical");
    expect(issues.at(-1)?.severity).toBe("notice");
  });
});

describe("summariseIssues", () => {
  it("scores an empty site as clean rather than dividing by zero", () => {
    expect(summariseIssues([], []).score).toBe(100);
  });

  it("counts only published subjects, and ignores notices when scoring", () => {
    const subjects = [
      subject({ slug: "clean" }),
      subject({ slug: "noticed", indexable: false }),
      subject({ slug: "broken", title: "", description: "" }),
      subject({ slug: "draft", published: false }),
    ];

    const summary = summariseIssues(subjects, auditSubjects(subjects));

    expect(summary.subjects).toBe(3);
    // "noticed" carries only a notice, so it still counts as clean.
    expect(summary.clean).toBe(2);
    expect(summary.critical).toBe(2);
    expect(summary.score).toBe(67);
  });
});

describe("countWords", () => {
  it("counts prose", () => {
    expect(countWords("one two three")).toBe(3);
  });

  it("ignores code blocks, which are not prose a reader can be sold on", () => {
    expect(countWords("one two\n```\nconst a = 1; const b = 2;\n```\nthree")).toBe(3);
  });

  it("counts a link by its text, not its URL", () => {
    expect(countWords("see [the guide](/guides/markup-vs-margin)")).toBe(3);
  });
});
