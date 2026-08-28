import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/metadata";

export type JsonLdObject = Record<string, unknown>;

/**
 * Sitewide publisher identity. Emitted once, in the root layout.
 *
 * `sameAs` is omitted rather than filled with guesses — structured data that
 * points at profiles which do not exist is worse than none.
 */
export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    areaServed: {
      "@type": "Country",
      name: siteConfig.marketName,
    },
    ...(siteConfig.socials.length > 0
      ? { sameAs: siteConfig.socials.map((social) => social.href) }
      : {}),
  };
}

/**
 * The site itself, plus the search action.
 *
 * `potentialAction` was held back until /search actually existed — declaring a
 * search endpoint that 404s is a broken promise to the crawler. It exists as
 * of Phase 4.
 */
export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: siteConfig.language,
    audience: {
      "@type": "BusinessAudience",
      geographicArea: {
        "@type": "Country",
        name: siteConfig.marketName,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface Crumb {
  name: string;
  /** Root-relative path. Omitted on the current page, which is the last crumb. */
  href?: string;
}

/**
 * Breadcrumb structured data.
 *
 * This must mirror the breadcrumb that is actually visible on the page —
 * marking up a trail the user cannot see is a structured-data violation, so
 * the same `Crumb[]` array feeds both the component and this builder.
 */
export function breadcrumbSchema(crumbs: Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}

/**
 * FAQ markup.
 *
 * Worth being clear-eyed about: since Google's 2023 change, FAQ rich results
 * are shown almost exclusively for government and health sites. We emit this
 * because it is valid, machine-readable, and useful to other consumers — not
 * because it will win a rich snippet. Only ever called with Q&As that are
 * visible on the page.
 */
export function faqSchema(faqs: ReadonlyArray<{ q: string; a: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/**
 * A calculator.
 *
 * `WebApplication` is the honest type here: it is a tool you operate in the
 * browser, not an article and not a product. The zero-price `offers` block is
 * how "free" is expressed in schema.org terms.
 */
export function webApplicationSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    inLanguage: siteConfig.language,
    countriesSupported: siteConfig.market,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };
}

/**
 * A written guide.
 *
 * `dateModified` is genuinely the last edit date, not the build date — a
 * document that claims to change every deploy teaches crawlers to ignore the
 * field.
 */
export function articleSchema({
  title,
  description,
  path,
  authorName,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  path: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: { "@type": "Organization", name: authorName },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    inLanguage: siteConfig.language,
  };
}

/** A listing page such as /tools or /categories/advertising. */
export function collectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: siteConfig.language,
    audience: {
      "@type": "BusinessAudience",
      geographicArea: {
        "@type": "Country",
        name: siteConfig.marketName,
      },
    },
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };
}
