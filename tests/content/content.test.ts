import { describe, expect, it } from "vitest";
import {
  getGuide,
  getGuidesForTool,
  listGuides,
  listIndexableGuides,
} from "@/lib/content/guides";
import { getPage, listPages } from "@/lib/content/pages";
import { readingMinutes } from "@/lib/content/reading-time";
import { searchDocs } from "@/lib/search";
import { buildSearchIndex } from "@/lib/search/build";
import { getTool, toolCatalog } from "@/lib/tools/catalog";
import { siteFaqs, homeFaqs } from "@/config/faqs";

/**
 * The content APIs became async when the admin store was introduced. These
 * tests run against an empty store, so what they actually assert is the
 * built-in seed content and the fallback behaviour — which is exactly the
 * state a fresh clone is in.
 */
describe("guides", () => {
  it("has guides", async () => {
    expect((await listGuides()).length).toBeGreaterThan(0);
  });

  it("sorts newest first", async () => {
    const dates = (await listGuides()).map((guide) => new Date(guide.publishedAt).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("gives every guide a URL-safe, unique slug", async () => {
    const slugs = (await listGuides()).map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("resolves every related tool", async () => {
    for (const guide of await listGuides()) {
      expect(guide.relatedTools.length).toBeGreaterThan(0);
      for (const toolSlug of guide.relatedTools) {
        expect(getTool(toolSlug), `${guide.slug} -> ${toolSlug}`).toBeDefined();
      }
    }
  });

  it("keeps SEO fields within display limits", async () => {
    for (const guide of await listGuides()) {
      const title = guide.seoTitle ?? guide.title;
      const description = guide.seoDescription ?? guide.excerpt;
      expect(title.length, `${guide.slug} title`).toBeLessThanOrEqual(65);
      expect(description.length, `${guide.slug} description`).toBeLessThanOrEqual(165);
    }
  });

  it("has substantive content, not a stub", async () => {
    for (const guide of await listGuides()) {
      expect(guide.contentMd.length, `${guide.slug}`).toBeGreaterThan(1500);
      expect(guide.excerpt.length).toBeGreaterThan(40);
      expect(readingMinutes(guide.contentMd)).toBeGreaterThanOrEqual(2);
    }
  });

  it("never claims to have been updated before it was published", async () => {
    for (const guide of await listGuides()) {
      expect(new Date(guide.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(guide.publishedAt).getTime(),
      );
    }
  });

  it("only lists indexable guides for the sitemap", async () => {
    for (const guide of await listIndexableGuides()) {
      expect(guide.isIndexable).toBe(true);
    }
  });

  it("links guides back from the tools they explain", async () => {
    // The relationship is declared on the guide and read from both ends.
    for (const guide of await listGuides()) {
      for (const toolSlug of guide.relatedTools) {
        const back = (await getGuidesForTool(toolSlug)).map((candidate) => candidate.slug);
        expect(back, `${toolSlug} should surface ${guide.slug}`).toContain(guide.slug);
      }
    }
  });

  it("returns nothing for a tool no guide covers", async () => {
    const guides = await listGuides();
    const covered = new Set(guides.flatMap((guide) => [...guide.relatedTools]));
    const uncovered = toolCatalog.find((tool) => !covered.has(tool.slug));

    if (uncovered) {
      expect(await getGuidesForTool(uncovered.slug)).toEqual([]);
    }
  });

  it("returns undefined for an unknown slug", async () => {
    expect(await getGuide("not-a-real-guide")).toBeUndefined();
  });
});

describe("pages", () => {
  const required = [
    "about",
    "privacy-policy",
    "terms",
    "disclaimer",
    "editorial-policy",
    "affiliate-disclosure",
  ];

  it("publishes every page the footer and legal requirements need", async () => {
    for (const slug of required) {
      expect(await getPage(slug), slug).toBeDefined();
    }
  });

  it("gives every page a title, content and an updated date", async () => {
    for (const page of await listPages()) {
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.contentMd.length, `${page.slug}`).toBeGreaterThan(400);
      expect(Number.isNaN(new Date(page.updatedAt).getTime())).toBe(false);
    }
  });

  it("keeps SEO descriptions within display limits", async () => {
    for (const page of await listPages()) {
      if (!page.seoDescription) continue;
      expect(page.seoDescription.length, `${page.slug}`).toBeLessThanOrEqual(165);
    }
  });

  it("returns undefined for an unknown slug", async () => {
    expect(await getPage("not-a-real-page")).toBeUndefined();
  });
});

describe("FAQs", () => {
  it("keeps the homepage subset inside the full set", () => {
    for (const faq of homeFaqs) {
      expect(siteFaqs).toContain(faq);
    }
  });

  it("has unique questions", () => {
    const questions = siteFaqs.map((faq) => faq.q);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("answers every question with something substantial", () => {
    for (const faq of siteFaqs) {
      expect(faq.a.length, faq.q).toBeGreaterThan(80);
    }
  });
});

describe("search", () => {
  it("indexes every published tool, indexable guide and category", async () => {
    const [index, guides] = await Promise.all([buildSearchIndex(), listIndexableGuides()]);
    const liveTools = toolCatalog.filter((tool) => tool.status === "live").length;
    expect(index.length).toBe(liveTools + guides.length + 4);
  });

  it("returns nothing for an empty query", async () => {
    const index = await buildSearchIndex();
    expect(searchDocs(index, "")).toEqual([]);
    expect(searchDocs(index, "   ")).toEqual([]);
  });

  it("returns nothing for a query that matches nothing", async () => {
    expect(searchDocs(await buildSearchIndex(), "zzzzqqqq")).toEqual([]);
  });

  it("finds a tool by its name", async () => {
    const results = searchDocs(await buildSearchIndex(), "roas");
    expect(results.length).toBeGreaterThan(0);
    expect(results.map((doc) => doc.href)).toContain("/tools/roas-calculator");
  });

  it("ranks an exact title match first", async () => {
    const [first] = searchDocs(await buildSearchIndex(), "break-even roas");
    expect(first?.href).toBe("/tools/break-even-roas-calculator");
  });

  it("finds guides as well as tools", async () => {
    const results = searchDocs(await buildSearchIndex(), "markup");
    expect(results.some((doc) => doc.kind === "guide")).toBe(true);
    expect(results.some((doc) => doc.kind === "tool")).toBe(true);
  });

  it("requires every term to match", async () => {
    // "margin" matches plenty; "zzzz" matches nothing, so the pair matches nothing.
    expect(searchDocs(await buildSearchIndex(), "margin zzzz")).toEqual([]);
  });

  it("is case insensitive", async () => {
    const index = await buildSearchIndex();
    expect(searchDocs(index, "ROAS").length).toBe(searchDocs(index, "roas").length);
  });

  it("points every result at a real internal URL", async () => {
    for (const doc of await buildSearchIndex()) {
      expect(doc.href).toMatch(/^\/(tools|guides|categories)\//);
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.description.length).toBeGreaterThan(0);
    }
  });
});

describe("reading time", () => {
  it("never returns less than a minute", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("one two three")).toBe(1);
  });

  it("scales with length", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    expect(readingMinutes(words)).toBe(2);
  });

  it("does not count code fences or link URLs", () => {
    const withCode = `word word\n\n\`\`\`\n${Array.from({ length: 500 }, () => "x").join(" ")}\n\`\`\``;
    expect(readingMinutes(withCode)).toBe(1);
  });
});
