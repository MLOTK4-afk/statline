import type { AthleteProfile, Tier } from "@/lib/types";

export type TierInput = Pick<
  AthleteProfile,
  | "endorsement"
  | "combine"
  | "combineVerified"
  | "highlightUrl"
  | "achievements"
  | "previousSeasonStats"
  | "stats"
  | "region"
  | "additionalSports"
  | "legendGrandfathered"
>;

/**
 * Tier is deterministic and derived from the profile itself — never stored,
 * never AI-generated — so it's always in sync with the athlete's data.
 * Takes only the fields it needs (TierInput) so callers like the builder's
 * live preview can compute a tier from in-progress form state without
 * assembling a full AthleteProfile.
 *
 * Legend  — already qualifies for Elite (below) AND has more than one sport
 *           on the profile. Multi-sport alone isn't enough -- an athlete
 *           needs a genuinely strong profile first, then breadth across
 *           sports is what elevates it to Legend.
 * Elite   — verified combine results OR a coach endorsement
 * Gold    — highlight video AND achievements
 * Silver  — stats AND region
 * Bronze  — everything else (a profile always exists at Bronze)
 *
 * "Achievements" also counts a filled-in Previous Season Stats field --
 * some athletes list real honors there (e.g. "3x state qualifier") instead
 * of the dedicated Achievements list, and the tier shouldn't miss genuine
 * accolades just because they landed in the wrong free-text box.
 *
 * `legendGrandfathered` bypasses the check above entirely -- it's set once
 * for athletes who already held Legend under the old "just add a second
 * sport" rule, so tightening the rule doesn't retroactively demote them.
 */
export function getAthleteTier(athlete: TierInput): Tier {
  if (athlete.legendGrandfathered) return "Legend";

  const totalSports = 1 + (athlete.additionalSports?.length ?? 0);
  const hasEndorsement = Boolean(athlete.endorsement?.quote);
  const hasVerifiedCombine = Boolean(
    athlete.combine && athlete.combine.length > 0 && athlete.combineVerified
  );
  const qualifiesForElite = hasEndorsement || hasVerifiedCombine;

  if (qualifiesForElite && totalSports > 1) return "Legend";
  if (qualifiesForElite) return "Elite";

  const hasVideo = Boolean(athlete.highlightUrl);
  const hasAchievements =
    athlete.achievements.length > 0 ||
    Boolean(athlete.previousSeasonStats?.trim());
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
