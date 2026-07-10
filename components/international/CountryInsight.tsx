"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Field";
import { COUNTRIES } from "@/lib/constants";
import {
  COUNTRY_EDUCATION_NOTES,
  DEFAULT_EDUCATION_NOTE,
} from "@/lib/international-content";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function CountryInsight() {
  const { t } = useLanguage();
  const [country, setCountry] = useState("");

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="font-heading text-xl text-white">{t("countryTitle")}</h3>
      <div className="mt-3 max-w-sm">
        <Select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">{t("countrySelect")}</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      {country && (
        <p className="mt-4 text-sm text-slate-300">
          {COUNTRY_EDUCATION_NOTES[country] ?? DEFAULT_EDUCATION_NOTE}
        </p>
      )}
    </div>
  );
}
