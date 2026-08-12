import type { JsonLdObject } from "@/lib/seo/jsonld";

/**
 * Emits structured data as a JSON-LD script tag.
 *
 * `JSON.stringify` does not escape `<`, so a string containing "</script>"
 * would break out of the tag. Replacing `<` with its unicode escape is valid
 * JSON and closes that hole — this matters more from Phase 4 onward, when the
 * payload starts including admin-authored text.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
