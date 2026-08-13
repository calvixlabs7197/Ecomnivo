import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * FAQ accordion built on native <details>/<summary>.
 *
 * Zero client JavaScript, keyboard-operable and screen-reader-correct for
 * free, and — the part that matters for SEO — the answer text is present in
 * the HTML whether or not the item is open, so it is crawlable and legitimately
 * eligible for the FAQPage markup we emit alongside it.
 */
export function Accordion({ items }: { items: ReadonlyArray<FaqItem> }) {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-medium text-ink transition-colors duration-150 ease-soft hover:text-brand">
            <span>{item.q}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 text-muted transition-transform duration-200 ease-soft group-open:rotate-180"
            />
          </summary>
          {/* Fades in on open only — an item already open on load should just
              be there, not animate at a reader who never asked for it. */}
          <p className="max-w-reading pb-5 leading-relaxed text-muted group-open:animate-fade-in">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
