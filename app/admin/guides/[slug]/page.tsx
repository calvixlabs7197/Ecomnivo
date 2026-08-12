import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuide, seedGuideSlugs } from "@/lib/content/guides";
import { getGuideRecord } from "@/lib/db/repositories";
import { GuideForm } from "@/components/admin/guide-form";

export default async function EditGuidePage({ params }: PageProps<"/admin/guides/[slug]">) {
  const { slug } = await params;
  const record = await getGuideRecord(slug);
  const guide = record ?? (await getGuide(slug));

  if (!guide) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/guides" className="text-sm text-brand hover:text-brand-hover">
          &larr; All guides
        </Link>
        <h1 className="mt-2 text-h2">{guide.title}</h1>
        <p className="mt-1 font-mono text-sm text-muted">/guides/{guide.slug}</p>
      </div>

      <GuideForm guide={guide} record={record} isNew={false} isSeed={seedGuideSlugs.has(slug)} />
    </div>
  );
}
