import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGuide, getGuideContent, GUIDES } from "@/lib/guides";
import { GuideDetailContent } from "@/components/international/GuideDetailContent";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Statline" };
  return { title: `${getGuideContent(guide, "en").title} | Statline` };
}

export default function GuideDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!getGuide(params.slug)) notFound();

  return <GuideDetailContent slug={params.slug} />;
}
