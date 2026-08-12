import type { Metadata } from "next";
import { ContentPage, contentPageMetadata } from "@/components/content/content-page";

const SLUG = "disclaimer";

export async function generateMetadata(): Promise<Metadata> {
  return contentPageMetadata(SLUG);
}

export default function Page() {
  return <ContentPage slug={SLUG} />;
}
