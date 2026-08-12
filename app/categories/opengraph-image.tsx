import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = "EcomNivo tool categories";
export const size = ogImageSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Categories",
    title: "Find the calculator for the question you have",
    subtitle: "Profitability, advertising, pricing and growth.",
  });
}
