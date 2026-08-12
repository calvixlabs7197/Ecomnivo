import { siteConfig } from "@/config/site";
import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = ogImageSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    title: siteConfig.tagline,
    subtitle: "Free calculators for profitability, advertising, pricing and growth.",
  });
}
