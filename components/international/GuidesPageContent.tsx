"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { GuidesList } from "@/components/international/GuidesList";

export function GuidesPageContent() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl text-white">{t("guidesTitle")}</h1>
      <p className="mt-2 text-slate-400">{t("guidesPageSubtitle")}</p>
      <GuidesList />
    </div>
  );
}
