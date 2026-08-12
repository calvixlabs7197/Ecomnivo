import { CATEGORY_SLUGS, getCategory } from "@/config/categories";
import { listToolsByCategory } from "@/lib/tools/resolve";
import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = "EcomNivo calculators by category";
export const size = ogImageSize;
export const contentType = ogContentType;

/** Prerender one card per category, matching the page's own static params. */
export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    return renderOgImage({
      title: "E-commerce calculators",
      subtitle: "Free tools for online sellers.",
    });
  }

  const count = (await listToolsByCategory(category.slug)).filter(
    (tool) => tool.status === "live",
  ).length;

  return renderOgImage({
    eyebrow: category.name,
    title: `${category.name} calculators`,
    subtitle: `${count} free tools — ${category.tagline.toLowerCase()}.`,
  });
}
