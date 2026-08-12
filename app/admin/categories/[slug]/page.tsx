import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";

import { requireRole } from "@/lib/auth/guards";
import { getCategory, isCategorySlug } from "@/config/categories";
import { ICON_NAMES, iconNameOf } from "@/config/icons";
import { resolveCategory } from "@/lib/categories/resolve";
import { resolveTools } from "@/lib/tools/resolve";
import { resetCategory, saveCategory } from "@/actions/admin";
import { relativeTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { SaveForm } from "@/components/admin/save-form";
import { PageHeader } from "@/components/admin/ui";
import {
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-fields";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[slug]">) {
  await requireRole("admin");

  const { slug } = await params;
  if (!isCategorySlug(slug)) notFound();

  const [category, tools] = await Promise.all([resolveCategory(slug), resolveTools()]);
  if (!category) notFound();

  const builtIn = getCategory(slug);
  const live = tools.filter((tool) => tool.category === slug && tool.status === "live");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={category.name}
        back={{ href: "/admin/categories", label: "All categories" }}
        meta={
          <>
            <span className="font-mono">/categories/{category.slug}</span>
            <span>
              {live.length} live {live.length === 1 ? "calculator" : "calculators"}
            </span>
            {category.isCustomised && category.updatedAt ? (
              <Badge tone="brand">Edited {relativeTime(category.updatedAt)}</Badge>
            ) : (
              <Badge tone="quiet">Built-in copy</Badge>
            )}
          </>
        }
        actions={
          <Link
            href={`/categories/${category.slug}` as Route}
            className="text-sm font-medium text-brand hover:text-brand-hover"
          >
            View page
          </Link>
        }
      />

      <SaveForm action={saveCategory} submitLabel="Save category">
        <input type="hidden" name="slug" value={category.slug} />

        <FormSection
          title="Content"
          description="Used on the category card, the hub page heading and its intro paragraph."
        >
          <TextField label="Name" name="name" defaultValue={category.name} required />
          <TextField
            label="Tagline"
            name="tagline"
            defaultValue={category.tagline}
            required
            help="One line, shown on the category card under the name."
          />
          <TextAreaField
            label="Description"
            name="description"
            rows={4}
            defaultValue={category.description}
            required
            help="The intro paragraph on the hub page, and its meta description unless you set one below."
          />
          <SelectField
            label="Icon"
            name="icon"
            defaultValue={category.iconName ?? (builtIn ? iconNameOf(builtIn.icon) : undefined)}
            options={ICON_NAMES.map((name) => ({ value: name, label: name }))}
            help="Chosen from a fixed set. Icons carry the difference between the four cards, so the palette does not have to."
          />
          <TextField
            label="Sort order"
            name="sortOrder"
            defaultValue={String(category.sortOrder)}
            help="Lower numbers appear first on the homepage and the categories page."
          />
        </FormSection>

        <FormSection
          title="SEO"
          description="Leave blank to use the name and description above."
        >
          <TextField
            label="SEO title"
            name="seoTitle"
            defaultValue={category.seoTitle}
            help="Defaults to “{Name} Calculators”. 65 characters or fewer."
          />
          <TextAreaField
            label="Meta description"
            name="seoDescription"
            rows={3}
            defaultValue={category.seoDescription}
            help="Defaults to the description above. 165 characters or fewer."
          />
        </FormSection>
      </SaveForm>

      {category.isCustomised ? (
        <form action={resetCategory} className="border-t border-rule pt-6">
          <input type="hidden" name="slug" value={category.slug} />
          <p className="max-w-reading text-sm leading-relaxed text-muted">
            Resetting discards these edits and restores the copy that ships in code. The
            category, its URL and the calculators filed under it are unaffected.
          </p>
          <button
            type="submit"
            className="mt-3 rounded-md border border-critical/30 px-3 py-2 text-sm font-medium text-critical transition-colors duration-150 ease-soft hover:bg-critical/5"
          >
            Reset to built-in copy
          </button>
        </form>
      ) : null}
    </div>
  );
}
