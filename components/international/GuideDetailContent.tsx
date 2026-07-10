"use client";

import Link from "next/link";
import { getGuide, getGuideContent } from "@/lib/guides";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card } from "@/components/ui/Card";

export function GuideDetailContent({ slug }: { slug: string }) {
  const { t, language } = useLanguage();
  const guide = getGuide(slug);
  if (!guide) return null;

  const content = getGuideContent(guide, language);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/international/guides"
        className="text-sm text-skyline-300 hover:text-white"
      >
        &larr; {t("allGuides")}
      </Link>
      <Card className="mt-4 p-8">
        <h1 className="text-3xl text-white">{content.title}</h1>
        <div className="mt-6 space-y-4 text-slate-300">
          {content.body.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}
