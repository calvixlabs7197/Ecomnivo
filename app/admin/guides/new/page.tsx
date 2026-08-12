import Link from "next/link";
import { GuideForm } from "@/components/admin/guide-form";

export default function NewGuidePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/guides" className="text-sm text-brand hover:text-brand-hover">
          &larr; All guides
        </Link>
        <h1 className="mt-2 text-h2">New guide</h1>
        <p className="mt-1 text-muted">
          Saved as a draft unless you set the status to published.
        </p>
      </div>

      <GuideForm isNew isSeed={false} />
    </div>
  );
}
