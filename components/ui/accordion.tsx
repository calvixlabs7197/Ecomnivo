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
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-medium text-ink">
            <span>{item.q}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 text-muted transition-transform duration-200 ease-soft group-open:rotate-180"
            />
          </summary>
          <p className="max-w-reading pb-5 leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
