"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AthleteProfile } from "@/lib/types";
import { INTERNATIONAL_SPORTS } from "@/lib/constants";
import { INTERNATIONAL_SPORT_INFO } from "@/lib/international-content";
import { GUIDES, getGuideContent } from "@/lib/guides";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/international/LanguageSwitcher";
import { SportTabs } from "@/components/international/SportTabs";
import { CountryInsight } from "@/components/international/CountryInsight";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/layout/Logo";

export default function InternationalPage() {
  const { t, language } = useLanguage();
  const [sport, setSport] = useState(INTERNATIONAL_SPORTS[0]);
  const [athletes, setAthletes] = useState<AthleteProfile[] | null>(null);

  useEffect(() => {
    fetch("/api/athletes?international=true")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, []);

  const filtered = useMemo(
    () => (athletes ?? []).filter((a) => a.sport === sport),
    [athletes, sport]
  );

  return (
    <div>
      <section className="angular-bg border-b border-white/10 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center">
            <Logo height={80} />
          </div>
          <div className="mt-4 flex justify-center">
            <LanguageSwitcher />
          </div>
          <p className="mt-6 font-heading text-sm uppercase tracking-[0.3em] text-intl-300">
            {t("tagline")}
          </p>
          <h1 className="mt-4 text-4xl text-white sm:text-6xl">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            {t("subhead")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LinkButton href="/international/build-profile" variant="accent" size="lg">
              {t("ctaBuildProfile")}
            </LinkButton>
            <LinkButton
              href="/international/guides"
              variant="outlineAccent"
              size="lg"
            >
              {t("guidesTitle")}
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl text-white">{t("sportsTitle")}</h2>
        <div className="mt-4">
          <SportTabs active={sport} onChange={setSport} />
        </div>
        {INTERNATIONAL_SPORT_INFO[sport] && (
          <p className="mt-4 max-w-2xl text-sm text-slate-400">
            {INTERNATIONAL_SPORT_INFO[sport].blurb}
          </p>
        )}

        <h3 className="mt-10 text-xl text-white">{t("directoryTitle")}</h3>
        {athletes === null ? (
          <p className="mt-4 text-slate-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={t("noAthletes")}
              description={t("beFirst")}
              action={
                <LinkButton href="/international/build-profile" size="sm">
                  {t("ctaBuildProfile")}
                </LinkButton>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((athlete) => (
              <ProfileCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-white/10 bg-navy-950/60 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CountryInsight />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl text-white">{t("guidesTitle")}</h2>
        <p className="mt-1 text-slate-400">{t("guidesSubtitle")}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => {
            const content = getGuideContent(guide, language);
            return (
              <Link key={guide.slug} href={`/international/guides/${guide.slug}`}>
                <Card className="h-full p-5 transition-colors hover:border-electric-500/50">
                  <h3 className="font-heading text-lg text-white">
                    {content.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {content.summary}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
