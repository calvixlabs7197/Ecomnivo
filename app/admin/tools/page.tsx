import Link from "next/link";
import type { Route } from "next";

import { resolveTools } from "@/lib/tools/resolve";
import { getCategory } from "@/config/categories";
import { Badge } from "@/components/ui/badge";

export default async function AdminToolsPage() {
  const tools = await resolveTools();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h2">Tools</h1>
        <p className="mt-2 max-w-reading leading-relaxed text-muted">
          Edit the name, description, SEO and visibility of every calculator. The maths
          itself lives in tested code and is not editable here — see the note at the
          bottom.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-rule bg-page">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Tool</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Category</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">Featured</th>
              <th scope="col" className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {tools.map((tool) => (
              <tr key={tool.slug}>
                <td className="px-4 py-3">
                  <span className="font-medium text-ink">{tool.name}</span>
                  <span className="mt-0.5 block font-mono text-xs text-muted">
                    /tools/{tool.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {getCategory(tool.category)?.name ?? tool.category}
                </td>
                <td className="px-4 py-3">
                  {tool.status === "live" ? (
                    <Badge tone="brand">Live</Badge>
                  ) : (
                    <Badge>Hidden</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{tool.featured ? "Yes" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/tools/${tool.slug}` as Route}
                    className="font-medium text-brand hover:text-brand-hover"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="max-w-reading rounded-lg border border-rule bg-page p-4 text-sm leading-relaxed text-muted">
        <strong className="font-medium text-ink">Why can&rsquo;t I add a calculator here?</strong>{" "}
        A calculator is a formula, and a formula stored in a database has to be evaluated
        at runtime — which means either an unsafe <code>eval</code> or an expression engine
        nobody can unit-test. Every calculator on this site is a pure function with
        hand-verified tests, because people make pricing decisions with the output. Adding
        one is a small code change plus a test. A safe formula builder is on the roadmap;
        it is not a shortcut worth taking badly.
      </p>
    </div>
  );
}
