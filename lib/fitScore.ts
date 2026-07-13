import type { AthleteProfile, Division } from "@/lib/types";

/**
 * Fit Score is a deterministic complement to the existing AI-generated
 * divisionMatch (lib/anthropic.ts) — that one gives a qualitative,
 * LLM-reasoned read; this one gives a transparent, recomputable number
 * built from concrete stat-vs-benchmark comparisons. Neither replaces
 * the other; both can render on the same profile.
 */
export type FitTier = Division | "JUCO";

export interface DivisionBenchmark {
  sport: string;
  division: FitTier;
  statName: string;
  medianValue: number;
  p75Value: number;
}

export interface FitScoreResult {
  score: number;
  tier: FitTier;
  explanation: string[];
}

const TIER_ORDER: FitTier[] = ["D1", "D2", "D3", "NAIA", "JUCO"];

/** Stats where a lower number is the better outcome (times), everything else assumes higher-is-better. */
const LOWER_IS_BETTER_HINTS = ["time", "dash", "sprint", "mile", "pace", "40"];

function isLowerBetter(statName: string): boolean {
  const n = statName.toLowerCase();
  return LOWER_IS_BETTER_HINTS.some((hint) => n.includes(hint));
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Athlete stats are free-text label/value pairs typed by the athlete in the
 * wizard (StatRowsEditor) — there's no controlled vocabulary to exact-match
 * against a benchmark's stat_name, so this does a best-effort keyword match.
 * Callers should treat a null result as "couldn't confidently match" and
 * skip that component rather than guess.
 */
function findMatchingStat(
  stats: Record<string, string>,
  statName: string
): number | null {
  const target = normalize(statName);
  for (const [label, value] of Object.entries(stats)) {
    const normLabel = normalize(label);
    if (normLabel.includes(target) || target.includes(normLabel)) {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

function parseWeightLbs(heightWeight: string | undefined): number | null {
  if (!heightWeight) return null;
  const match = heightWeight.match(/(\d+(\.\d+)?)\s*(lb|lbs|pounds)/i);
  return match ? parseFloat(match[1]) : null;
}

/** Maps a value against median/p75 to a 0-100 component score, honoring stat direction. */
function scoreComponent(
  value: number,
  median: number,
  p75: number,
  lowerIsBetter: boolean
): number {
  if (lowerIsBetter) {
    if (value <= p75) return 100;
    if (value <= median) {
      const span = median - p75 || 1;
      return 60 + ((median - value) / span) * 40;
    }
    return Math.max(0, (median / value) * 60);
  }
  if (value >= p75) return 100;
  if (value >= median) {
    const span = p75 - median || 1;
    return 60 + ((value - median) / span) * 40;
  }
  return Math.max(0, (value / (median || 1)) * 60);
}

function tierFromScore(score: number): FitTier {
  if (score >= 80) return "D1";
  if (score >= 60) return "D2";
  if (score >= 45) return "D3";
  if (score >= 30) return "NAIA";
  return "JUCO";
}

export function calculateFitScore(
  athlete: Pick<
    AthleteProfile,
    "sport" | "gpa" | "stats" | "heightWeight" | "region"
  >,
  benchmarks: DivisionBenchmark[]
): FitScoreResult {
  // Score against the D1 benchmark row consistently (the top of the
  // hierarchy) so every athlete is measured against the same bar, then
  // bucket the resulting composite into a tier. Comparing each athlete
  // against a different division's benchmark would make scores across
  // athletes non-comparable.
  const d1Benchmarks = benchmarks.filter(
    (b) => b.division === "D1" && b.sport === athlete.sport
  );

  const explanation: string[] = [];
  const components: { weight: number; score: number }[] = [];

  const gpaBenchmark = d1Benchmarks.find((b) => b.statName === "gpa");
  const gpaValue = athlete.gpa ? parseFloat(athlete.gpa) : null;
  if (gpaBenchmark && gpaValue !== null && !Number.isNaN(gpaValue)) {
    const s = scoreComponent(
      gpaValue,
      gpaBenchmark.medianValue,
      gpaBenchmark.p75Value,
      false
    );
    components.push({ weight: 0.4, score: s });
    explanation.push(
      gpaValue >= gpaBenchmark.medianValue
        ? `GPA (${gpaValue}) exceeds D1 median (${gpaBenchmark.medianValue}) for ${athlete.sport}.`
        : `GPA (${gpaValue}) is below D1 median (${gpaBenchmark.medianValue}) for ${athlete.sport}.`
    );
  }

  const statBenchmark = d1Benchmarks.find(
    (b) => b.statName !== "gpa" && b.statName !== "weight_lb"
  );
  const statValue = statBenchmark
    ? findMatchingStat(athlete.stats, statBenchmark.statName)
    : null;
  if (statBenchmark && statValue !== null) {
    const lowerBetter = isLowerBetter(statBenchmark.statName);
    const s = scoreComponent(
      statValue,
      statBenchmark.medianValue,
      statBenchmark.p75Value,
      lowerBetter
    );
    components.push({ weight: 0.4, score: s });
    const label = statBenchmark.statName.replace(/_/g, " ");
    const beatsMedian = lowerBetter
      ? statValue <= statBenchmark.medianValue
      : statValue >= statBenchmark.medianValue;
    explanation.push(
      beatsMedian
        ? `${label} (${statValue}) exceeds D1 median (${statBenchmark.medianValue}) for ${athlete.sport}.`
        : `${label} (${statValue}) is below D1 median (${statBenchmark.medianValue}) for ${athlete.sport}.`
    );
  }

  const weightBenchmark = d1Benchmarks.find((b) => b.statName === "weight_lb");
  const weightValue = parseWeightLbs(athlete.heightWeight);
  if (weightBenchmark && weightValue !== null) {
    const s = scoreComponent(
      weightValue,
      weightBenchmark.medianValue,
      weightBenchmark.p75Value,
      false
    );
    components.push({ weight: 0.2, score: s });
  }

  if (components.length === 0) {
    return {
      score: 0,
      tier: "JUCO",
      explanation: [
        "Not enough matching stats, GPA, or benchmark data yet to compute a fit score.",
        "Add your GPA and sport-specific stats to your profile to unlock this.",
      ],
    };
  }

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  let score =
    components.reduce((sum, c) => sum + c.weight * c.score, 0) / totalWeight;

  if (athlete.region) {
    score = Math.min(100, score + 5);
    explanation.push(
      `Profile includes region (${athlete.region}), giving coaches added competition context.`
    );
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  if (!d1Benchmarks.length) {
    explanation.unshift(
      `No benchmark data yet for ${athlete.sport} — this score is a placeholder until real division benchmarks are added.`
    );
  }

  return {
    score,
    tier: tierFromScore(score),
    explanation: explanation.slice(0, 3),
  };
}

export const FIT_TIER_ORDER = TIER_ORDER;
