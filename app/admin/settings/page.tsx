import { requireRole } from "@/lib/auth/guards";
import { getSettings } from "@/lib/db/repositories";
import { saveSiteSettings } from "@/actions/admin";
import { SaveForm } from "@/components/admin/save-form";
import { FormSection, TextAreaField, TextField } from "@/components/admin/form-fields";

/**
 * Settings are super_admin only.
 *
 * The layout already established that the visitor is staff; this narrows it
 * further, and an editor probing the URL gets a 404 rather than a 403 — no
 * confirmation that the page exists.
 */
export default async function AdminSettingsPage() {
  await requireRole("super_admin");
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h2">Settings</h1>
        <p className="mt-2 max-w-reading leading-relaxed text-muted">
          Site identity, SEO defaults and the public analytics identifiers.
        </p>
      </div>

      <SaveForm action={saveSiteSettings} submitLabel="Save settings">
        <FormSection title="Identity">
          <TextField label="Site name" name="siteName" defaultValue={settings.siteName} required />
          <TextField label="Tagline" name="tagline" defaultValue={settings.tagline} required />
          <TextAreaField
            label="Description"
            name="description"
            rows={3}
            defaultValue={settings.description}
            required
            help="Used as the homepage meta description and in the hero."
          />
          <TextField
            label="Contact email"
            name="contactEmail"
            defaultValue={settings.contactEmail ?? ""}
            help="Published on the legal pages. Leave blank and they say contact details are not yet available."
          />
        </FormSection>

        <FormSection
          title="SEO defaults"
          description="Used where a page has not set its own."
        >
          <TextField
            label="Default SEO title"
            name="defaultSeoTitle"
            defaultValue={settings.defaultSeoTitle}
            required
          />
          <TextAreaField
            label="Default meta description"
            name="defaultSeoDescription"
            rows={3}
            defaultValue={settings.defaultSeoDescription}
            required
            help="165 characters or fewer — the field rejects longer values."
          />
        </FormSection>

        <FormSection
          title="Analytics and advertising"
          description="Public identifiers only. Anything genuinely secret belongs in environment variables, never in the database."
        >
          <TextField
            label="GA4 measurement ID"
            name="ga4MeasurementId"
            defaultValue={settings.ga4MeasurementId ?? ""}
            placeholder="G-XXXXXXXXXX"
            help="Leave blank to keep analytics off entirely. When set, visitors are still asked for consent before anything loads."
          />
          <TextField
            label="Ad client ID"
            name="adClientId"
            defaultValue={settings.adClientId ?? ""}
            placeholder="ca-pub-…"
            help="Leave blank to keep advertising off. Ads also require consent."
          />
        </FormSection>
      </SaveForm>
    </div>
  );
}
