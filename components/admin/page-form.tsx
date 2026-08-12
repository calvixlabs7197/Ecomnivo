import { savePage, removePage } from "@/actions/admin";
import { SaveForm } from "@/components/admin/save-form";
import {
  CheckboxField,
  FormSection,
  TextAreaField,
  TextField,
} from "@/components/admin/form-fields";
import type { PageDoc } from "@/lib/content/types";
import type { PageRecord } from "@/lib/db/types";

/**
 * Create or edit a page.
 *
 * A page created here is live at `/<slug>` immediately — the catch-all route
 * uses `dynamicParams`, so there is no rebuild between saving and seeing it.
 * Built-in pages (about, the legal set) can be edited but not deleted;
 * "deleting" an override restores the original text.
 */
export function PageForm({
  page,
  record,
  isNew,
  isSeed,
}: {
  page?: PageDoc;
  record?: PageRecord;
  isNew: boolean;
  isSeed: boolean;
}) {
  return (
    <>
      <SaveForm action={savePage} submitLabel={isNew ? "Create page" : "Save page"}>
        <FormSection title="Content">
          <TextField
            label="Slug"
            name="slug"
            defaultValue={page?.slug}
            required
            readOnly={!isNew}
            placeholder="how-we-work"
            help={
              isNew
                ? "Becomes the URL: /your-slug. Reserved names like tools, guides and admin are rejected."
                : "Fixed once created — changing a URL breaks every existing link to it."
            }
          />
          <TextField label="Title" name="title" defaultValue={page?.title} required />
          <TextAreaField
            label="Body (Markdown)"
            name="contentMd"
            rows={22}
            defaultValue={page?.contentMd}
            required
          />
        </FormSection>

        <FormSection title="SEO and visibility">
          <TextField
            label="SEO title"
            name="seoTitle"
            defaultValue={page?.seoTitle}
            help="Leave blank to use the page title. 65 characters or fewer."
          />
          <TextAreaField
            label="Meta description"
            name="seoDescription"
            rows={3}
            defaultValue={page?.seoDescription}
            help="165 characters or fewer."
          />
          <CheckboxField
            label="Published"
            name="isPublished"
            defaultChecked={record?.isPublished ?? true}
            help="Unpublished pages 404 and are removed from the sitemap."
          />
          <CheckboxField
            label="Allow search engines to index this page"
            name="isIndexable"
            defaultChecked={page?.isIndexable !== false}
          />
        </FormSection>
      </SaveForm>

      {!isNew ? (
        <form action={removePage} className="mt-8 border-t border-rule pt-6">
          <input type="hidden" name="slug" value={page?.slug ?? ""} />
          <p className="text-sm text-muted">
            {isSeed
              ? "This is a built-in page. Deleting your changes restores the original text."
              : "Deleting removes this page and its URL. This cannot be undone."}
          </p>
          <button
            type="submit"
            className="mt-3 rounded-md border border-critical/30 px-3 py-2 text-sm font-medium text-critical transition-colors duration-150 ease-soft hover:bg-critical/5"
          >
            {isSeed ? "Revert to built-in version" : "Delete page"}
          </button>
        </form>
      ) : null}
    </>
  );
}
