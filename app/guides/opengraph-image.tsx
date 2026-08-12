import { listGuides } from "@/lib/content/guides";
import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = "EcomNivo e-commerce guides";
export const size = ogImageSize;
export const contentType = ogContentType;

export default async function OpengraphImage() {
  const count = (await listGuides()).length;

  return renderOgImage({
    eyebrow: "Guides",
    title: "The numbers behind the calculators",
    subtitle: `${count} ${count === 1 ? "guide" : "guides"} on margin, advertising and growth.`,
  });
}
