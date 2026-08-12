import { getCategory } from "@/config/categories";
import { getTool } from "@/lib/tools/catalog";
import { listPublishedTools } from "@/lib/tools/resolve";
import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = "EcomNivo calculator";
export const size = ogImageSize;
export const contentType = ogContentType;

/** One prerendered card per live tool, matching the page's own static params. */
export async function generateStaticParams() {
  return (await listPublishedTools()).map((tool) => ({ slug: tool.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    return renderOgImage({
      title: "E-commerce calculators",
      subtitle: "Free tools for online sellers.",
    });
  }

  const category = getCategory(tool.category);

  return renderOgImage({
    eyebrow: category?.name,
    title: tool.name,
    subtitle: tool.shortDescription,
  });
}
