import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/**
 * Shared Open Graph card generator.
 *
 * Next's `opengraph-image` file convention applies to the segment it sits in
 * and is NOT inherited by nested routes — a root-level card leaves every other
 * page with no social image at all. So each segment gets its own thin
 * `opengraph-image.tsx` that calls this.
 *
 * Cards are generated at build time and served as static PNGs. A system font
 * stack is used rather than fetching Inter: at this size the difference is
 * imperceptible and it keeps a network request out of the build.
 */
export const ogImageSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function renderOgImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "76px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "11px",
              backgroundColor: "#2563eb",
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {eyebrow ? (
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#2563eb",
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div
            style={{
              fontSize: title.length > 46 ? 62 : 74,
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.03em",
              lineHeight: 1.06,
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>

          <div style={{ fontSize: 28, color: "#6b7280", maxWidth: "900px", lineHeight: 1.4 }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "26px",
            fontSize: 23,
            color: "#6b7280",
          }}
        >
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    ogImageSize,
  );
}
