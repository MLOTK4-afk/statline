import type { AthleteProfile, Tier } from "@/lib/types";

export type TierInput = Pick<
  AthleteProfile,
  | "endorsement"
  | "combine"
  | "combineVerified"
  | "highlightUrl"
  | "achievements"
  | "stats"
  | "region"
  | "additionalSports"
>;

/**
 * Tier is deterministic and derived from the profile itself — never stored,
 * never AI-generated — so it's always in sync with the athlete's data.
 * Takes only the fields it needs (TierInput) so callers like the builder's
 * live preview can compute a tier from in-progress form state without
 * assembling a full AthleteProfile.
 *
 * Legend  — more than one sport on the profile (checked first, above Elite)
 * Elite   — verified combine results OR a coach endorsement
 * Gold    — highlight video AND achievements
 * Silver  — stats AND region
 * Bronze  — everything else (a profile always exists at Bronze)
 */
export function getAthleteTier(athlete: TierInput): Tier {
  const totalSports = 1 + (athlete.additionalSports?.length ?? 0);
  if (totalSports > 1) return "Legend";

  const hasEndorsement = Boolean(athlete.endorsement?.quote);
  const hasVerifiedCombine = Boolean(
    athlete.combine && athlete.combine.length > 0 && athlete.combineVerified
  );
  if (hasEndorsement || hasVerifiedCombine) return "Elite";

  const hasVideo = Boolean(athlete.highlightUrl);
  const hasAchievements = athlete.achievements.length > 0;
  if (hasVideo && hasAchievements) return "Gold";

  const hasStats = Object.keys(athlete.stats).length > 0;
  const hasRegion = Boolean(athlete.region);
  if (hasStats && hasRegion) return "Silver";

  return "Bronze";
}

export const TIER_RANK: Record<Tier, number> = {
  Legend: 5,
  Elite: 4,
  Gold: 3,
  Silver: 2,
  Bronze: 1,
};

export const TIER_LABEL: Record<Tier, string> = {
  Legend: "Statline Legend",
  Elite: "Statline Elite",
  Gold: "Gold",
  Silver: "Silver",
  Bronze: "Bronze",
};
