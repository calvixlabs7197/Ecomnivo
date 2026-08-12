import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * Builds an absolute, canonical URL.
 *
 * Canonical form: no trailing slash anywhere except the homepage, no query
 * string. Two URLs that differ only by a trailing slash are two pages as far
 * as a crawler is concerned, so this is the only place paths become URLs.
 */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`absoluteUrl expects a root-relative path, received "${path}"`);
  }
  // Bare origin for the homepage. Next normalises the canonical tag to this
  // form anyway, so emitting it here keeps the sitemap and the canonical
  // byte-identical instead of differing by a trailing slash.
  if (path === "/") return siteConfig.url;
  return `${siteConfig.url}${path.replace(/\/$/, "")}`;
}

export interface BuildMetadataArgs {
  /** Page-level title. The root layout appends " | EcomNivo" unless `absoluteTitle`. */
  title: string;
  description: string;
  /** Root-relative path, e.g. "/tools". Becomes the canonical URL. */
  path: string;
  /** Use the title verbatim, without the site-name template. */
  absoluteTitle?: boolean;
  /** Excluded from the index but still crawled for links. */
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * The single metadata factory. No page hand-rolls a <title> or a canonical —
 * that is how those drift apart.
 *
 * Open Graph images are intentionally not set here: the `opengraph-image`
 * file convention cascades down the route tree, and Next merges it into both
 * the OG and Twitter tags. Setting `images` here would override that.
 */
export function buildMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noindex = false,
  type = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataArgs): Metadata {
  const url = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
