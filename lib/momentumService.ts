import { store } from "@/lib/storage";
import { calculateMomentum, type MomentumResult } from "@/lib/momentum";
import { computeAthleteCompleteness } from "@/lib/completeness";

const WINDOW_DAYS = 28;

/** The actual computation (I/O + pure calculateMomentum) shared by the on-demand API route and the /api/cron/momentum route, so there's exactly one place this logic lives. */
export async function computeAthleteMomentum(
  athleteId: string
): Promise<MomentumResult | null> {
  const athlete = await store.getAthlete(athleteId);
  if (!athlete) return null;

  const sinceIso = new Date(
    Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const [viewTimestamps, starTimestamps] = await Promise.all([
    store.getEventTimestampsForAthlete("profile_view", athleteId, sinceIso),
    store.getStarTimestampsForAthlete(athleteId, sinceIso),
  ]);

  const { percent } = computeAthleteCompleteness(athlete);

  return calculateMomentum({
    viewTimestamps,
    starTimestamps,
    completenessPercent: percent,
    updatedAt: athlete.updatedAt,
  });
}

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/** Returns the cached value if it's fresh; otherwise recomputes and re-caches. This is what keeps momentum off the "recompute on every page load" path without needing the cron to have run yet (handy for local dev, too). */
export async function getOrRefreshMomentum(
  athleteId: string
): Promise<MomentumResult | null> {
  const cached = await store.getCachedMomentum(athleteId);
  const isFresh =
    cached && Date.now() - new Date(cached.computedAt).getTime() < STALE_AFTER_MS;
  if (isFresh) return { label: cached.label, trendPercent: cached.trendPercent };

  const fresh = await computeAthleteMomentum(athleteId);
  if (!fresh) return null;
  await store.setCachedMomentum(athleteId, fresh);
  return fresh;
}

const SPARKLINE_DAYS = 30;

/** Daily profile-view counts for the last 30 days, oldest first -- only fetched for the profile owner's own view, not on every Browse card. Not cached like the label/trend; cheap and low-traffic. */
export async function getViewSparkline(athleteId: string): Promise<number[]> {
  const sinceIso = new Date(
    Date.now() - SPARKLINE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const timestamps = await store.getEventTimestampsForAthlete(
    "profile_view",
    athleteId,
    sinceIso
  );
  const counts = new Array(SPARKLINE_DAYS).fill(0);
  const now = Date.now();
  for (const ts of timestamps) {
    const daysAgo = Math.floor(
      (now - new Date(ts).getTime()) / (24 * 60 * 60 * 1000)
    );
    const idx = SPARKLINE_DAYS - 1 - daysAgo;
    if (idx >= 0 && idx < SPARKLINE_DAYS) counts[idx]++;
  }
  return counts;
}
