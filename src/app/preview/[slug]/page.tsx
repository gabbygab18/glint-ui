import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewStage } from "@/components/preview-stage";
import { bySlug, registry } from "@/registry";

// Bare, full-viewport render of one demo. Used for "Open ↗" and thumbnail capture.
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/[slug]">): Promise<Metadata> {
  const entry = bySlug.get((await params).slug);
  return { title: entry ? `${entry.name} preview` : "Preview", robots: { index: false } };
}

export default async function PreviewPage({ params }: PageProps<"/preview/[slug]">) {
  const { slug } = await params;
  if (!bySlug.has(slug)) notFound();
  return <PreviewStage slug={slug} />;
}
