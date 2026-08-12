import Link from "next/link";
import type { Route } from "next";

import { requireRole } from "@/lib/auth/guards";
import { resolveCategories } from "@/lib/categories/resolve";
import { resolveTools } from "@/lib/tools/resolve";
import { relativeTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import {
  Callout,
  DataTable,
  PageHeader,
  Panel,
  RowTitle,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminCategoriesPage() {
  await requireRole("admin");

  const [categories, tools] = await Promise.all([resolveCategories(), resolveTools()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="The four hubs every calculator is filed under. Each one is a landing page in its own right, so its name, intro and icon are worth editing."
      />

      <Panel>
        <DataTable
          head={
            <>
              <Th>Category</Th>
              <Th>Tagline</Th>
              <Th align="right">Live tools</Th>
              <Th>Source</Th>
              <Th align="right">Actions</Th>
            </>
          }
          minWidth="52rem"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const live = tools.filter(
              (tool) => tool.category === category.slug && tool.status === "live",
            ).length;

            return (
              <tr key={category.slug}>
                <Td>
                  <div className="flex items-start gap-2.5">
                    <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                    <RowTitle
                      title={category.name}
                      path={`/categories/${category.slug}`}
                      href={`/admin/categories/${category.slug}` as Route}
                    />
                  </div>
                </Td>
                <Td className="max-w-sm text-muted">{category.tagline}</Td>
                <Td align="right" className="tabular-nums">
                  {live}
                </Td>
                <Td>
                  {category.isCustomised ? (
                    <div className="flex flex-col gap-1">
                      <Badge tone="brand">Edited</Badge>
                      {category.updatedAt ? (
                        <span className="text-xs text-muted">
                          {relativeTime(category.updatedAt)}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <Badge tone="quiet">Built-in</Badge>
                  )}
                </Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/categories/${category.slug}` as Route}
                      className="text-sm font-medium text-muted hover:text-ink"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/categories/${category.slug}` as Route}
                      className="text-sm font-medium text-brand hover:text-brand-hover"
                    >
                      Edit
                    </Link>
                  </div>
                </Td>
              </tr>
            );
          })}
        </DataTable>
      </Panel>

      <Callout title="Why there is no “new category” button">
        A category slug is a URL, a key every calculator is filed under, and a member of a
        union the compiler checks. Adding a fifth is a code change that the type system helps
        with; creating one from a text field would produce a live URL with nothing in it and
        no tool assigned to it. Renaming and rewriting one, on the other hand, is pure
        content — which is exactly what this screen does.
      </Callout>
    </div>
  );
}
