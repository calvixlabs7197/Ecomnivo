import Link from "next/link";
import { PageForm } from "@/components/admin/page-form";

export default function NewPagePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/pages" className="text-sm text-brand hover:text-brand-hover">
          &larr; All pages
        </Link>
        <h1 className="mt-2 text-h2">New page</h1>
        <p className="mt-1 text-muted">
          Live at its URL as soon as you save it — no rebuild required.
        </p>
      </div>

      <PageForm isNew isSeed={false} />
    </div>
  );
}
