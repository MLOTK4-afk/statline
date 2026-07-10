export const COUNTRY_EDUCATION_NOTES: Record<string, string> = {
  England:
    "English athletes typically present GCSEs and A-Levels. U.S. schools generally convert A-Level grades (A*–E) to an equivalent GPA using a credential evaluation service.",
  Brazil:
    "Brazilian athletes typically present Ensino Médio transcripts and, where applicable, ENEM scores. A credential evaluation service can convert your 0–10 scale to a U.S. 4.0 GPA scale.",
  France:
    "French athletes typically present the Baccalauréat. Scores are graded out of 20 and are usually converted to a U.S. 4.0 GPA scale by a credential evaluation service.",
  Germany:
    "German athletes typically present the Abitur, graded on a 1.0 (best) to 4.0/5.0 (passing/failing) scale — the reverse direction from U.S. GPA — so a professional conversion is especially important.",
  Spain:
    "Spanish athletes typically present Bachillerato transcripts, graded 0–10. A credential evaluation service converts this to an equivalent U.S. GPA.",
  Nigeria:
    "Nigerian athletes typically present WAEC or NECO results. U.S. schools generally review these directly or through a credential evaluation service alongside standardized test scores.",
  "South Korea":
    "South Korean athletes typically present secondary school transcripts graded on a percentile or letter-grade system, which a credential evaluation service can convert to a U.S. GPA scale.",
  Australia:
    "Australian athletes typically present their state Year 12 certificate (e.g. HSC, VCE, QCE). These are generally converted to a U.S. GPA scale by a credential evaluation service.",
  Canada:
    "Canadian athletes typically present provincial high school transcripts, which are usually the most straightforward to convert since grading scales are similar to the U.S.",
  Mexico:
    "Mexican athletes typically present Bachillerato/Preparatoria transcripts, graded 0–10. A credential evaluation service converts this to a U.S. GPA scale.",
};

export const DEFAULT_EDUCATION_NOTE =
  "Every country's grading system is different. A credential evaluation service can officially convert your transcript to a U.S.-equivalent GPA that you can share with coaches and admissions offices.";

export const INTERNATIONAL_SPORT_INFO: Record<
  string,
  { blurb: string }
> = {
  Soccer: {
    blurb:
      "U.S. college soccer recruits heavily from club and academy systems worldwide. Highlight full-match footage and club/academy competition level alongside your stats.",
  },
  Basketball: {
    blurb:
      "International basketball prospects are often evaluated on tape from club, academy, or national team competition — clear footage against strong competition matters more than raw stats alone.",
  },
  Tennis: {
    blurb:
      "College tennis recruiting leans heavily on ITF, national ranking, and tournament results — keep your ranking history and results current on your profile.",
  },
  "Track & Field": {
    blurb:
      "Track & field recruiting is stats-first — verified times, marks, and meet-level competition context (national vs. regional vs. club) carry the most weight.",
  },
};
