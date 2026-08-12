import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin, /account and /dashboard do not exist yet. They are listed
        // now so the rule is in place before the routes are, rather than
        // after a crawler has already found them.
        disallow: ["/admin", "/api/", "/account", "/dashboard", "/search"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
