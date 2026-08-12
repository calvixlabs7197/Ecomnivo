import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { getSettings } from "@/lib/db/repositories";
import { storeWritable } from "@/lib/db/store";
import { saveSiteSettings } from "@/actions/admin";
import { formatDateTime } from "@/lib/admin/format";
import { SaveForm } from "@/components/admin/save-form";
import { FormSection, TextAreaField, TextField } from "@/components/admin/form-fields";
import { Callout, PageHeader } from "@/components/admin/ui";

/**
 * Settings are super_admin only.
 *
 * The layout already established that the visitor is staff; this narrows it
 * further, and an editor probing the URL gets a 404 rather than a 403 — no
 * confirmation that the page exists.
 */
export default async function AdminSettingsPage() {
  await requireRole("super_admin");

  const [settings, writable] = await Promise.all([getSettings(), storeWritable()]);
  const saved = new Date(settings.updatedAt).getTime() > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Site identity, SEO defaults, social profiles and the public analytics identifiers."
        meta={
          <span>
            {saved ? `Last saved ${formatDateTime(settings.updatedAt)}` : "Using code defaults"}
          </span>
        }
      />

      {!writable ? (
        <Callout tone="caution" title="Saving is unavailable on this host">
          The filesystem is read-only, so Save will be refused with an explanation rather than
          appearing to work. See <Link href="/admin/system" className="font-medium text-brand hover:text-brand-hover">system status</Link>.
        </Callout>
      ) : null}

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
          title="Social profiles"
          description="One per line, as “Label | URL”. These also become the Organization sameAs list in structured data, so only add accounts that genuinely exist."
        >
          <TextAreaField
            label="Profiles"
            name="socials"
            rows={4}
            defaultValue={settings.socials
              .map((social) => `${social.label} | ${social.href}`)
              .join("\n")}
            help="Example: X | https://x.com/ecomnivo — every URL must start with https://. Leave blank for none."
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

      <Callout title="What is deliberately not editable here">
        Passwords, signing secrets and API keys are environment variables, not settings. A
        secret in the content store is a secret in a JSON file, in a backup, and in whatever
        the store gets exported to next. The two identifiers above are already visible in the
        browser on every page, which is what makes them safe to keep here.
      </Callout>
    </div>
  );
}
