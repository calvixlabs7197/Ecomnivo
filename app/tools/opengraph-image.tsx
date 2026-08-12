import { toolCatalog } from "@/lib/tools/catalog";
import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = "All EcomNivo e-commerce calculators and tools";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Tools",
    title: "E-commerce calculators that show their working",
    subtitle: `${toolCatalog.length} free tools for profitability, advertising, pricing and growth.`,
  });
}
