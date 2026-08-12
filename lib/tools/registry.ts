import type { ToolDefinition, ToolInput } from "@/lib/tools/types";
import { getTool, toolCatalog } from "@/lib/tools/catalog";
import { getAllToolEngines, getToolEngine } from "@/lib/tools/engines";

// Advertising
import { roasContent } from "@/lib/tools/content/roas-calculator";
import { breakEvenRoasContent } from "@/lib/tools/content/break-even-roas-calculator";
import { cpcContent } from "@/lib/tools/content/cpc-calculator";
import { cpmContent } from "@/lib/tools/content/cpm-calculator";
import { ctrContent } from "@/lib/tools/content/ctr-calculator";
import { cpaContent } from "@/lib/tools/content/cpa-calculator";
import { cacContent } from "@/lib/tools/content/cac-calculator";
import { adBudgetContent } from "@/lib/tools/content/ad-budget-calculator";

// Profitability
import { ecommerceProfitContent } from "@/lib/tools/content/ecommerce-profit-calculator";
import { shopifyProfitContent } from "@/lib/tools/content/shopify-profit-calculator";
import { productProfitContent } from "@/lib/tools/content/product-profit-calculator";
import { profitMarginContent } from "@/lib/tools/content/profit-margin-calculator";
import { grossProfitContent } from "@/lib/tools/content/gross-profit-calculator";
import { netProfitContent } from "@/lib/tools/content/net-profit-calculator";

// Pricing
import { markupContent } from "@/lib/tools/content/markup-calculator";
import { sellingPriceContent } from "@/lib/tools/content/selling-price-calculator";
import { discountContent } from "@/lib/tools/content/discount-calculator";
import { wholesalePriceContent } from "@/lib/tools/content/wholesale-price-calculator";

// Growth
import { conversionRateContent } from "@/lib/tools/content/conversion-rate-calculator";
import { aovContent } from "@/lib/tools/content/aov-calculator";
import { revenueContent } from "@/lib/tools/content/revenue-calculator";
import { ltvContent } from "@/lib/tools/content/ltv-calculator";

/** See `engines/index.ts` — same contravariance reason, same soundness argument. */
function widen<I extends ToolInput>(content: ToolDefinition<I>): ToolDefinition<ToolInput> {
  return content as ToolDefinition<ToolInput>;
}

/**
 * The server-side half: page prose, keyed by slug.
 *
 * Importing this module pulls in every tool's FAQs and explanations, which is
 * why the calculator island imports `engines` instead.
 */
const contents: ToolDefinition<ToolInput>[] = [
  widen(roasContent),
  widen(breakEvenRoasContent),
  widen(cpcContent),
  widen(cpmContent),
  widen(ctrContent),
  widen(cpaContent),
  widen(cacContent),
  widen(adBudgetContent),

  widen(ecommerceProfitContent),
  widen(shopifyProfitContent),
  widen(productProfitContent),
  widen(profitMarginContent),
  widen(grossProfitContent),
  widen(netProfitContent),

  widen(markupContent),
  widen(sellingPriceContent),
  widen(discountContent),
  widen(wholesalePriceContent),

  widen(conversionRateContent),
  widen(aovContent),
  widen(revenueContent),
  widen(ltvContent),
];

const registry = new Map(contents.map((content) => [content.slug, content]));

export function getToolContent(slug: string): ToolDefinition<ToolInput> | undefined {
  return registry.get(slug);
}

// ---------------------------------------------------------------------------
// Invariants
//
// These run when the module is first imported, which happens during the build.
// A violation fails the build rather than shipping a broken or thin page: the
// "not live until it is complete" rule from §5.4 of the architecture is
// enforced by the build, not by code review.
// ---------------------------------------------------------------------------

const problems: string[] = [];

for (const content of contents) {
  const summary = getTool(content.slug);
  const engine = getToolEngine(content.slug);

  if (!summary) {
    problems.push(`"${content.slug}" has content but no catalog entry.`);
    continue;
  }

  if (summary.status !== "live") {
    problems.push(
      `"${content.slug}" has content but its catalog status is "${summary.status}" — the page would be unreachable.`,
    );
  }

  if (!engine) {
    problems.push(`"${content.slug}" has content but no calculation engine.`);
  } else {
    // The worked example must exercise exactly the fields the calculator shows.
    // This is what stops a documented example drifting from the real inputs.
    const fieldNames = engine.fields.map((field) => field.name).sort();
    const exampleKeys = Object.keys(content.example.inputs).sort();

    if (fieldNames.join(",") !== exampleKeys.join(",")) {
      problems.push(
        `"${content.slug}" worked example does not match its fields (fields: ${fieldNames.join(", ")}; example: ${exampleKeys.join(", ")}).`,
      );
    }
  }

  if (content.faqs.length < 3) {
    problems.push(`"${content.slug}" has ${content.faqs.length} FAQs; at least 3 are required.`);
  }

  if (content.interpretation.length < 2 || content.commonMistakes.length < 2) {
    problems.push(`"${content.slug}" needs at least 2 interpretation points and 2 common mistakes.`);
  }

  if (content.relatedTools.length < 2) {
    problems.push(`"${content.slug}" needs at least 2 related tools.`);
  }

  for (const related of content.relatedTools) {
    if (related === content.slug) {
      problems.push(`"${content.slug}" lists itself as a related tool.`);
    } else if (!getTool(related)) {
      problems.push(`"${content.slug}" links to unknown related tool "${related}".`);
    }
  }
}

for (const summary of toolCatalog) {
  if (summary.status === "live" && !registry.has(summary.slug)) {
    problems.push(
      `"${summary.slug}" is marked live in the catalog but has no content — its page would 404.`,
    );
  }
}

for (const engine of getAllToolEngines()) {
  if (!registry.has(engine.slug)) {
    problems.push(`Engine "${engine.slug}" has no matching content.`);
  }
}

if (problems.length > 0) {
  throw new Error(`Tool registry is inconsistent:\n${problems.map((p) => `  · ${p}`).join("\n")}`);
}
