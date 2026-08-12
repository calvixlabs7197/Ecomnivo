import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Wordmark plus a mark of three ascending bars — the plainest possible read on
 * "measure something and watch it improve". Inline SVG so it costs no request
 * and inherits colour from the surrounding text.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-7 shrink-0"
        focusable="false"
      >
        <rect width="24" height="24" rx="6" className="fill-brand" />
        <rect x="6" y="13" width="3" height="5" rx="1" fill="#ffffff" />
        <rect x="10.5" y="10" width="3" height="8" rx="1" fill="#ffffff" opacity="0.85" />
        <rect x="15" y="6" width="3" height="12" rx="1" fill="#ffffff" opacity="0.7" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-ink">{siteConfig.name}</span>
    </span>
  );
}
