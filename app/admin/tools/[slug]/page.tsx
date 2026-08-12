import Link from "next/link";
import { notFound } from "next/navigation";

import { categories } from "@/config/categories";
import { getTool } from "@/lib/tools/catalog";
import { getToolRecord } from "@/lib/db/repositories";
import { getToolContent } from "@/lib/tools/registry";
import { SaveForm } from "@/components/admin/save-form";
import { saveTool } from "@/actions/admin";
import {
  CheckboxField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-fields";

export default async function EditToolPage({ params }: PageProps<"/admin/tools/[slug]">) {
  const { slug } = await params;
  const tool = getTool(slug);
  const content = getToolContent(slug);

  if (!tool) notFound();

  const record = await getToolRecord(slug);
  const related = record?.relatedTools?.length
    ? record.relatedTools
    : (content?.relatedTools ?? []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/tools" className="text-sm text-brand hover:text-brand-hover">
          &larr; All tools
        </Link>
        <h1 className="mt-2 text-h2">{tool.name}</h1>
        <p className="mt-1 font-mono text-sm text-muted">/tools/{tool.slug}</p>
      </div>

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
            defaultChecked={record?.isPublished ?? tool.status === "live"}
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
    </div>
  );
}
