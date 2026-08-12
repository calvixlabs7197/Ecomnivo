import Link from "next/link";
import { notFound } from "next/navigation";

import { getPage, seedPageSlugs } from "@/lib/content/pages";
import { getPageRecord } from "@/lib/db/repositories";
import { PageForm } from "@/components/admin/page-form";

export default async function EditPagePage({ params }: PageProps<"/admin/pages/[slug]">) {
  const { slug } = await params;
  const record = await getPageRecord(slug);
  const page = record ?? (await getPage(slug));

  if (!page) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/pages" className="text-sm text-brand hover:text-brand-hover">
          &larr; All pages
        </Link>
        <h1 className="mt-2 text-h2">{page.title}</h1>
        <p className="mt-1 font-mono text-sm text-muted">/{page.slug}</p>
      </div>

      <PageForm page={page} record={record} isNew={false} isSeed={seedPageSlugs.has(slug)} />
    </div>
  );
}
