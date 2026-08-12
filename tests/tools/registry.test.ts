import { describe, expect, it } from "vitest";
import { toolCatalog, getLiveTools, getTool } from "@/lib/tools/catalog";
import { getToolContent } from "@/lib/tools/registry";
import { getAllToolEngines, getToolEngine } from "@/lib/tools/engines";

/**
 * The registry throws on import if anything is inconsistent, so simply loading
 * this file exercises most of it. These tests state the guarantees explicitly
 * so a failure names what broke rather than just "module threw".
 */
describe("tool registry", () => {
  it("gives every live tool both an engine and page content", () => {
    for (const tool of getLiveTools()) {
      expect(getToolEngine(tool.slug), `${tool.slug} engine`).toBeDefined();
      expect(getToolContent(tool.slug), `${tool.slug} content`).toBeDefined();
    }
  });

  it("gives planned tools neither, so they cannot be routed to by accident", () => {
    for (const tool of toolCatalog.filter((candidate) => candidate.status === "planned")) {
      expect(getToolEngine(tool.slug), `${tool.slug} engine`).toBeUndefined();
      expect(getToolContent(tool.slug), `${tool.slug} content`).toBeUndefined();
    }
  });

  it("matches every worked example to its engine's fields", () => {
    for (const engine of getAllToolEngines()) {
      const content = getToolContent(engine.slug);
      expect(content).toBeDefined();
      if (!content) continue;

      const fieldNames = engine.fields.map((field) => field.name).sort();
      const exampleKeys = Object.keys(content.example.inputs).sort();
      expect(exampleKeys, `${engine.slug} worked example`).toEqual(fieldNames);
    }
  });

  it("resolves every related-tool link and never self-links", () => {
    for (const engine of getAllToolEngines()) {
      const content = getToolContent(engine.slug);
      if (!content) continue;

      expect(content.relatedTools.length).toBeGreaterThanOrEqual(2);
      for (const related of content.relatedTools) {
        expect(related, `${engine.slug} self-link`).not.toBe(engine.slug);
        expect(getTool(related), `${engine.slug} -> ${related}`).toBeDefined();
      }
    }
  });

  it("holds every live tool to the anti-thin-page bar", () => {
    for (const engine of getAllToolEngines()) {
      const content = getToolContent(engine.slug);
      if (!content) continue;

      expect(content.faqs.length, `${engine.slug} FAQs`).toBeGreaterThanOrEqual(3);
      expect(content.interpretation.length).toBeGreaterThanOrEqual(2);
      expect(content.commonMistakes.length).toBeGreaterThanOrEqual(2);
      expect(content.formula.expression.length).toBeGreaterThan(0);
      expect(content.seo.title.length).toBeGreaterThan(0);
      expect(content.seo.description.length).toBeGreaterThan(0);
    }
  });

  it("keeps SEO titles and descriptions within sensible display limits", () => {
    for (const engine of getAllToolEngines()) {
      const content = getToolContent(engine.slug);
      if (!content) continue;

      // Not hard limits from Google, but past these the tail gets truncated.
      expect(content.seo.title.length, `${engine.slug} title`).toBeLessThanOrEqual(65);
      expect(content.seo.description.length, `${engine.slug} description`).toBeLessThanOrEqual(165);
    }
  });

  it("keeps catalog slugs unique and URL-safe", () => {
    const slugs = toolCatalog.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const slug of slugs) {
      expect(slug, `${slug} is not URL-safe`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
