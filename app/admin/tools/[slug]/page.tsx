import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";

import { requireRole } from "@/lib/auth/guards";
import { resolveCategories } from "@/lib/categories/resolve";
import { getTool } from "@/lib/tools/catalog";
import { getToolRecord } from "@/lib/db/repositories";
import { getToolContent } from "@/lib/tools/registry";
import { resetTool, saveTool } from "@/actions/admin";
import { relativeTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { SaveForm } from "@/components/admin/save-form";
import { PageHeader } from "@/components/admin/ui";
import {
  CheckboxField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-fields";

export default async function EditToolPage({ params }: PageProps<"/admin/tools/[slug]">) {
  await requireRole("admin");

  const { slug } = await params;
  const tool = getTool(slug);
  const content = getToolContent(slug);

  if (!tool) notFound();

  const [record, categories] = await Promise.all([getToolRecord(slug), resolveCategories()]);
  const related = record?.relatedTools?.length
    ? record.relatedTools
    : (content?.relatedTools ?? []);
  const isLive = record?.isPublished ?? tool.status === "live";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={record?.name ?? tool.name}
        back={{ href: "/admin/tools", label: "All calculators" }}
        meta={
          <>
            <span className="font-mono">/tools/{tool.slug}</span>
            {isLive ? <Badge tone="positive">Live</Badge> : <Badge tone="caution">Hidden</Badge>}
            <span>
              {record ? `Edited ${relativeTime(record.updatedAt)}` : "Using built-in copy"}
            </span>
          </>
        }
        actions={
          isLive ? (
            <Link
              href={`/tools/${tool.slug}` as Route}
              className="text-sm font-medium text-brand hover:text-brand-hover"
            >
              View page
            </Link>
          ) : null
        }
      />

      <SaveForm action={saveTool}>
        <input type="hidden" name="slug" value={tool.slug} />

        <FormSection
          title="Listing"
          description="How this tool appears on cards, category pages and search."
        >
          <TextField
            label="Name"
            name="name"
            defaultValue={record?.name ?? tool.name}
            help="Leave as-is to keep the built-in name."
          />
          <TextAreaField
            label="Short description"
            name="shortDescription"
            rows={2}
            defaultValue={record?.shortDescription ?? tool.shortDescription}
            help="One sentence. Shown on cards and used as the meta description fallback."
          />
          <SelectField
            label="Category"
            name="categorySlug"
            defaultValue={record?.categorySlug ?? tool.category}
            options={categories.map((category) => ({
              value: category.slug,
              label: category.name,
            }))}
          />
        </FormSection>

        <FormSection
          title="SEO"
          description="Leave blank to use the values written alongside the calculator."
        >
          <TextField
            label="SEO title"
            name="seoTitle"
            defaultValue={record?.seoTitle ?? content?.seo.title}
            help="Aim for 65 characters or fewer, or search results will truncate it."
          />
          <TextAreaField
            label="Meta description"
            name="seoDescription"
            rows={3}
            defaultValue={record?.seoDescription ?? content?.seo.description}
            help="Aim for 165 characters or fewer."
          />
        </FormSection>

        <FormSection title="Visibility and links">
          <CheckboxField
            label="Published"
            name="isPublished"
            defaultChecked={isLive}
            help="Unpublishing removes the tool from listings, search and the sitemap. Nothing is deleted."
          />
          <CheckboxField
            label="Featured on the homepage"
            name="isFeatured"
            defaultChecked={record?.isFeatured ?? Boolean(tool.featured)}
            help="The homepage shows the first six featured tools."
          />
          <TextField
            label="Sort order"
            name="sortOrder"
            defaultValue={String(record?.sortOrder ?? 0)}
            help="Lower numbers appear first within a category."
          />
          <TextField
            label="Related tools"
            name="relatedTools"
            defaultValue={related.join(", ")}
            help="Comma-separated slugs. Every one is checked against the catalogue on save."
          />
        </FormSection>
      </SaveForm>

      {record ? (
        <form action={resetTool} className="border-t border-rule pt-6">
          <input type="hidden" name="slug" value={tool.slug} />
          <p className="max-w-reading text-sm leading-relaxed text-muted">
            This calculator has admin overrides. Resetting discards them and goes back to the
            name, description and SEO written alongside the code. The calculator itself is
            untouched either way.
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
