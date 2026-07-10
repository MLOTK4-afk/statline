"use client";

import Link from "next/link";
import { GUIDES, getGuideContent } from "@/lib/guides";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card } from "@/components/ui/Card";

export function GuidesList() {
  const { language } = useLanguage();

  return (
    <div className="mt-8 space-y-4">
      {GUIDES.map((guide) => {
        const content = getGuideContent(guide, language);
        return (
          <Link key={guide.slug} href={`/international/guides/${guide.slug}`}>
            <Card className="p-6 transition-colors hover:border-electric-500/50">
              <h2 className="font-heading text-2xl text-white">
                {content.title}
              </h2>
              <p className="mt-2 text-slate-400">{content.summary}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
