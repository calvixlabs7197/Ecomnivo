import type { ToolEngine, ToolInput } from "@/lib/tools/types";

// Advertising
import { roasEngine } from "@/lib/tools/engines/roas-calculator";
import { breakEvenRoasEngine } from "@/lib/tools/engines/break-even-roas-calculator";
import { cpcEngine } from "@/lib/tools/engines/cpc-calculator";
import { cpmEngine } from "@/lib/tools/engines/cpm-calculator";
import { ctrEngine } from "@/lib/tools/engines/ctr-calculator";
import { cpaEngine } from "@/lib/tools/engines/cpa-calculator";
import { cacEngine } from "@/lib/tools/engines/cac-calculator";
import { adBudgetEngine } from "@/lib/tools/engines/ad-budget-calculator";

// Profitability
import { ecommerceProfitEngine } from "@/lib/tools/engines/ecommerce-profit-calculator";
import { shopifyProfitEngine } from "@/lib/tools/engines/shopify-profit-calculator";
import { productProfitEngine } from "@/lib/tools/engines/product-profit-calculator";
import { profitMarginEngine } from "@/lib/tools/engines/profit-margin-calculator";
import { grossProfitEngine } from "@/lib/tools/engines/gross-profit-calculator";
import { netProfitEngine } from "@/lib/tools/engines/net-profit-calculator";

// Pricing
import { markupEngine } from "@/lib/tools/engines/markup-calculator";
import { sellingPriceEngine } from "@/lib/tools/engines/selling-price-calculator";
import { discountEngine } from "@/lib/tools/engines/discount-calculator";
import { wholesalePriceEngine } from "@/lib/tools/engines/wholesale-price-calculator";

// Growth
import { conversionRateEngine } from "@/lib/tools/engines/conversion-rate-calculator";
import { aovEngine } from "@/lib/tools/engines/aov-calculator";
import { revenueEngine } from "@/lib/tools/engines/revenue-calculator";
import { ltvEngine } from "@/lib/tools/engines/ltv-calculator";

/**
 * Widens a strongly-typed engine for storage in a heterogeneous registry.
 *
 * `ToolEngine<RoasInput>` is not assignable to `ToolEngine<ToolInput>` because
 * `compute` is contravariant in its input. The assertion is sound in practice:
 * the runner only ever calls `compute` with a record built from that same
 * engine's own `fields`, and `registry.ts` proves at build time that the field
 * names and the worked example agree.
 */
function widen<I extends ToolInput>(engine: ToolEngine<I>): ToolEngine<ToolInput> {
  return engine as ToolEngine<ToolInput>;
}

/**
 * The client-safe half of the tool system.
 *
 * This module is imported by the calculator island, so everything reachable
 * from here ships to the browser. Keep it to field metadata and arithmetic —
 * page prose belongs in `lib/tools/content/`.
 */
const engines: ToolEngine<ToolInput>[] = [
  widen(roasEngine),
  widen(breakEvenRoasEngine),
  widen(cpcEngine),
  widen(cpmEngine),
  widen(ctrEngine),
  widen(cpaEngine),
  widen(cacEngine),
  widen(adBudgetEngine),

  widen(ecommerceProfitEngine),
  widen(shopifyProfitEngine),
  widen(productProfitEngine),
  widen(profitMarginEngine),
  widen(grossProfitEngine),
  widen(netProfitEngine),

  widen(markupEngine),
  widen(sellingPriceEngine),
  widen(discountEngine),
  widen(wholesalePriceEngine),

  widen(conversionRateEngine),
  widen(aovEngine),
  widen(revenueEngine),
  widen(ltvEngine),
];

const engineRegistry = new Map(engines.map((engine) => [engine.slug, engine]));

export function getToolEngine(slug: string): ToolEngine<ToolInput> | undefined {
  return engineRegistry.get(slug);
}

export function getAllToolEngines(): ToolEngine<ToolInput>[] {
  return [...engineRegistry.values()];
}
