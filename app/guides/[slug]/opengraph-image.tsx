import { getGuide, listGuides } from "@/lib/content/guides";
import { ogContentType, ogImageSize, renderOgImage } from "@/components/seo/og-image";

export const alt = "EcomNivo guide";
export const size = ogImageSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return (await listGuides()).map((guide) => ({ slug: guide.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    return renderOgImage({
      title: "E-commerce guides",
      subtitle: "The numbers behind the calculators.",
    });
  }

  return renderOgImage({
    eyebrow: guide.category,
    title: guide.title,
    subtitle: guide.excerpt,
  });
}
