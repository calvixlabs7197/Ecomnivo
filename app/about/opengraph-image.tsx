import { siteConfig } from "@/config/site";
import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = `About ${siteConfig.name}`;
export const size = ogImageSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "About",
    title: "Calculators that show their working",
    subtitle: "How the tools are built, verified, and paid for.",
  });
}
