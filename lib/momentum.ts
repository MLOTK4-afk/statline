export type MomentumLabel = "Rising" | "Steady" | "Cooling";

export interface MomentumResult {
  label: MomentumLabel;
  trendPercent: number;
}

export interface MomentumInput {
  /** ISO timestamps of profile_view events in roughly the last 28 days. */
  viewTimestamps: string[];
  /**
   * ISO timestamps of "star" events (a coach saving the profile) in the
   * last 28 days -- the closest real proxy for coach interest this app has,
   * since there's no coach-messaging system to measure instead.
   */
  starTimestamps: string[];
  completenessPercent: number;
  updatedAt: string;
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function countInWindow(timestamps: string[], start: number, end: number) {
  return timestamps.filter((ts) => {
    const t = new Date(ts).getTime();
    return t >= start && t < end;
  }).length;
}

/**
 * "Rising"/"Steady"/"Cooling" from period-over-period activity change
 * (profile views + stars, last 14 days vs. the 14 days before that) --
 * >20% up is Rising, >20% down is Cooling, otherwise Steady.
 *
 * Completeness % and days-since-update don't feed the raw trend_percent
 * (which always reflects real activity change), but they can damp a
 * "Rising" read down to "Steady": a view spike on a stale or barely-started
 * profile is more likely noise than real recruiting momentum.
 */
export function calculateMomentum(input: MomentumInput): MomentumResult {
  const now = (input.now ?? new Date()).getTime();
  const recentStart = now - 14 * DAY_MS;
  const priorStart = now - 28 * DAY_MS;

  const recentActivity =
    countInWindow(input.viewTimestamps, recentStart, now) +
    countInWindow(input.starTimestamps, recentStart, now);
  const priorActivity =
    countInWindow(input.viewTimestamps, priorStart, recentStart) +
    countInWindow(input.starTimestamps, priorStart, recentStart);

  let trendPercent: number;
  if (priorActivity === 0) {
    trendPercent = recentActivity > 0 ? 100 : 0;
  } else {
    trendPercent = Math.round(
      ((recentActivity - priorActivity) / priorActivity) * 100
    );
  }
  trendPercent = Math.max(-100, Math.min(300, trendPercent));

  let label: MomentumLabel =
    trendPercent > 20 ? "Rising" : trendPercent < -20 ? "Cooling" : "Steady";

  const daysSinceUpdate = (now - new Date(input.updatedAt).getTime()) / DAY_MS;
  if (label === "Rising" && daysSinceUpdate > 60) label = "Steady";
  if (label === "Rising" && input.completenessPercent < 40) label = "Steady";

  return { label, trendPercent };
}
