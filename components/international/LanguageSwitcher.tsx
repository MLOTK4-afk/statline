"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGES } from "@/lib/constants";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as typeof language)}
      className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-electric-500 focus:outline-none"
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
