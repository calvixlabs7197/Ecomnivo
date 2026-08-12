import { notFound } from "next/navigation";

import { getPage } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, type Crumb } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MarkdownContent } from "@/components/content/markdown";
import { JsonLd } from "@/components/seo/json-ld";

/**
 * The single template behind /about, the legal pages, and any page the admin
 * creates.
 *
 * Each built-in route is a thin file that names its slug, so the routes stay
 * explicit and typed; admin-created pages are served by the `app/[slug]`
 * catch-all using the same component.
 */
export async function ContentPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();

  const crumbs: Crumb[] = [{ name: "Home", href: "/" }, { name: page.title }];

  const updatedLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(page.updatedAt));

  return (
    <>
      <Container className="py-10 sm:py-14">
        <Breadcrumbs crumbs={crumbs} />
        <div className="mt-6 max-w-reading">
          <h1 className="text-h1">{page.title}</h1>
          <p className="mt-3 text-sm text-muted">
            Last updated <time dateTime={page.updatedAt}>{updatedLabel}</time>
          </p>
        </div>
      </Container>

      <Container className="pb-24">
        <MarkdownContent content={page.contentMd} />
      </Container>

      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  );
}

/** Metadata helper so each route file stays to a handful of lines. */
export async function contentPageMetadata(slug: string) {
  const page = await getPage(slug);

  if (!page) {
    return buildMetadata({
      title: "Not found",
      description: "This page does not exist.",
      path: `/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? "",
    path: `/${slug}`,
    noindex: page.isIndexable === false,
  });
}
