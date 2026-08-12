import Link from "next/link";
import type { Route } from "next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { cn } from "@/lib/utils";

/**
 * Renders admin-authored Markdown.
 *
 * This is a Server Component: `react-markdown` and its plugins run at build
 * time and only the resulting HTML reaches the browser, so a fairly heavy
 * parser costs the visitor nothing.
 *
 * On sanitisation — `react-markdown` escapes raw HTML by default, so today
 * `rehypeSanitize` is belt and braces rather than the only thing standing
 * between us and an XSS. It is here because the moment someone enables
 * `rehype-raw` to allow an embed, it becomes the only thing standing between
 * us and an XSS, and by then nobody will remember to add it.
 *
 * Styling comes from an explicit component map rather than a typography
 * plugin: it is one dependency fewer, and every element is on the same type
 * scale as the rest of the site instead of a parallel one.
 */
const components = {
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2 className="mt-12 scroll-mt-24 text-h2 first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
    <h3 className="mt-8 scroll-mt-24 text-h3" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.ComponentProps<"p">) => (
    <p className="mt-4 leading-relaxed text-muted" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => (
    <ul
      className="mt-4 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-muted marker:text-rule-strong"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => (
    <ol
      className="mt-4 flex list-decimal flex-col gap-2 pl-5 leading-relaxed text-muted marker:text-muted"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentProps<"li">) => <li {...props}>{children}</li>,
  strong: ({ children, ...props }: React.ComponentProps<"strong">) => (
    <strong className="font-semibold text-ink" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote className="mt-6 border-l-2 border-brand pl-4 text-muted italic" {...props}>
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: React.ComponentProps<"code">) => (
    <code
      className="rounded-sm bg-surface-strong px-1.5 py-0.5 text-[0.9em] tabular-nums text-ink"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => (
    <pre
      className="mt-6 overflow-x-auto rounded-md border border-rule bg-surface p-4 text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: (props: React.ComponentProps<"hr">) => (
    <hr className="mt-10 border-rule" {...props} />
  ),
  // Wide tables scroll inside their own container so the page body never does.
  table: ({ children, ...props }: React.ComponentProps<"table">) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.ComponentProps<"th">) => (
    <th className="border-b border-rule-strong px-3 py-2 font-semibold text-ink" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentProps<"td">) => (
    <td className="border-b border-rule px-3 py-2 tabular-nums text-muted" {...props}>
      {children}
    </td>
  ),
  a: ({ href, children, ...props }: React.ComponentProps<"a">) => {
    const target = href ?? "";
    const isInternal = target.startsWith("/");
    const className =
      "font-medium text-brand underline decoration-brand/30 underline-offset-2 transition-colors duration-150 ease-soft hover:text-brand-hover hover:decoration-brand";

    if (isInternal) {
      return (
        <Link href={target as Route} className={className}>
          {children}
        </Link>
      );
    }

    // External links get rel="noopener" for security and "nofollow" because we
    // do not vouch for what an author linked to.
    return (
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  },
} as const;

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-reading", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
