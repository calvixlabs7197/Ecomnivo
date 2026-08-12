import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPage, listCustomPageSlugs, seedPageSlugs } from "@/lib/content/pages";
import { ContentPage, contentPageMetadata } from "@/components/content/content-page";

/**
 * Serves pages the admin created.
 *
 * A root-level catch-all is a blunt instrument, so two things keep it in
 * check. Next resolves static routes first, so every built-in page keeps its
 * own explicit file and this never sees those requests. And anything that is
 * not a published custom page 404s, including the built-in slugs — otherwise
 * two routes would claim the same URL.
 *
 * `dynamicParams` is true so a page created in admin is live immediately,
 * without a rebuild. That is the whole point of an admin panel.
 */
export async function generateStaticParams() {
  const slugs = await listCustomPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return contentPageMetadata(slug);
}

export default async function CustomPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;

  // Built-in pages own their own routes; this must not shadow them.
  if (seedPageSlugs.has(slug)) notFound();

  const page = await getPage(slug);
  if (!page) notFound();

  return <ContentPage slug={slug} />;
}
