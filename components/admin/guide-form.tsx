import { saveGuide, removeGuide } from "@/actions/admin";
import { SaveForm } from "@/components/admin/save-form";
import {
  CheckboxField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-fields";
import type { GuideRecord } from "@/lib/db/types";
import type { GuideDoc } from "@/lib/content/types";

/**
 * One form for creating and editing.
 *
 * The slug is read-only once a guide exists: changing it would silently break
 * every existing link and lose whatever ranking the URL had earned. Deleting
 * and recreating is the deliberate, visible way to do it.
 */
export function GuideForm({
  guide,
  record,
  isNew,
  isSeed,
}: {
  guide?: GuideDoc;
  record?: GuideRecord;
  isNew: boolean;
  /** A built-in guide being overridden — deleting restores the original. */
  isSeed: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <SaveForm action={saveGuide} submitLabel={isNew ? "Create guide" : "Save guide"}>
        <FormSection title="Content">
          <TextField
            label="Slug"
            name="slug"
            defaultValue={guide?.slug}
            required
            readOnly={!isNew}
            placeholder="how-to-price-a-product"
            help={
              isNew
                ? "Becomes the URL: /guides/your-slug. Lowercase words separated by hyphens."
                : "Fixed once published — changing a URL breaks every existing link to it."
            }
          />
          <TextField label="Title" name="title" defaultValue={guide?.title} required />
          <TextAreaField
            label="Excerpt"
            name="excerpt"
            rows={2}
            defaultValue={guide?.excerpt}
            required
            help="One or two sentences. Shown on cards and used as the meta description fallback."
          />
          <TextAreaField
            label="Body (Markdown)"
            name="contentMd"
            rows={22}
            defaultValue={guide?.contentMd}
            required
            help="Markdown with tables, code blocks and links. Internal links like /tools/roas-calculator become real navigations."
          />
        </FormSection>

        <FormSection title="Details">
          <TextField
            label="Category"
            name="category"
            defaultValue={guide?.category ?? "Pricing"}
            required
          />
          <TextField
            label="Tags"
            name="tags"
            defaultValue={guide?.tags.join(", ")}
            help="Comma-separated."
          />
          <TextField
            label="Author"
            name="authorName"
            defaultValue={guide?.author.name ?? "EcomNivo"}
            required
          />
          <TextField
            label="Publish date"
            name="publishedAt"
            defaultValue={(guide?.publishedAt ?? today).slice(0, 10)}
            required
            help="YYYY-MM-DD. A future date with status 'published' stays hidden until it arrives."
          />
          <TextField
            label="Related tools"
            name="relatedTools"
            defaultValue={guide?.relatedTools.join(", ")}
            help="Comma-separated slugs. These tools will link back to this guide automatically."
          />
        </FormSection>

        <FormSection title="SEO and visibility">
          <SelectField
            label="Status"
            name="status"
            defaultValue={record?.status ?? "draft"}
            options={[
              { value: "draft", label: "Draft — not visible" },
              { value: "scheduled", label: "Scheduled — not visible yet" },
              { value: "published", label: "Published" },
            ]}
          />
          <TextField
            label="SEO title"
            name="seoTitle"
            defaultValue={guide?.seoTitle}
            help="Leave blank to use the title. 65 characters or fewer."
          />
          <TextAreaField
            label="Meta description"
            name="seoDescription"
            rows={3}
            defaultValue={guide?.seoDescription}
            help="Leave blank to use the excerpt. 165 characters or fewer."
          />
          <CheckboxField
            label="Allow search engines to index this guide"
            name="isIndexable"
            defaultChecked={guide?.isIndexable ?? true}
            help="Unchecking adds noindex and removes it from the sitemap. It stays reachable by URL."
          />
        </FormSection>
      </SaveForm>

      {!isNew ? (
        <form action={removeGuide} className="mt-8 border-t border-rule pt-6">
          <input type="hidden" name="slug" value={guide?.slug ?? ""} />
          <p className="text-sm text-muted">
            {isSeed
              ? "This is a built-in guide. Deleting your changes restores the original version."
              : "Deleting removes this guide and its URL. This cannot be undone."}
          </p>
          <button
            type="submit"
            className="mt-3 rounded-md border border-critical/30 px-3 py-2 text-sm font-medium text-critical transition-colors duration-150 ease-soft hover:bg-critical/5"
          >
            {isSeed ? "Revert to built-in version" : "Delete guide"}
          </button>
        </form>
      ) : null}
    </>
  );
}
