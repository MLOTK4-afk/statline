"use client";

import { useEffect, useState } from "react";
import type { SportEntry } from "@/lib/types";
import type { DivisionBenchmark, FitScoreResult } from "@/lib/fitScore";
import { calculateFitScore } from "@/lib/fitScore";
import { Badge } from "@/components/ui/Badge";
import { FitScoreCard } from "@/components/profile/FitScoreCard";
import { getSportAccent } from "@/lib/sportTheme";
import { cn } from "@/lib/cn";

/**
 * Sport-specific panel for multi-sport profiles -- a tab per sport (primary
 * first) swaps the positions/jersey/highlight-film/stats/achievements/Fit
 * Score shown below. Person-level info that genuinely doesn't vary by sport
 * (name, GPA itself, endorsement, scouting report) lives outside this
 * component. Only rendered when an athlete has more than one sport;
 * single-sport profiles never mount this, so their layout is untouched.
 *
 * Fit Score for the primary sport is passed in already computed (the page
 * does it server-side, like every other profile). Switching to an
 * additional sport fetches that sport's division benchmarks and recomputes
 * client-side -- `calculateFitScore` is a pure function, so no new API
 * route is needed, just the existing /api/division-benchmarks lookup.
 */
export function SportTabs({
  primary,
  additional,
  gpa,
  heightWeight,
  region,
  primaryFitScore,
}: {
  primary: SportEntry;
  additional: SportEntry[];
  gpa?: string;
  heightWeight?: string;
  region: string;
  primaryFitScore?: FitScoreResult;
}) {
  const entries = [primary, ...additional];
  const [active, setActive] = useState(0);
  const current = entries[active];
  const accent = getSportAccent(current.sport);

  const [fitScore, setFitScore] = useState(primaryFitScore);
  const [fitScoreLoading, setFitScoreLoading] = useState(false);

  useEffect(() => {
    if (active === 0) {
      setFitScore(primaryFitScore);
      return;
    }
    let cancelled = false;
    setFitScoreLoading(true);
    fetch(`/api/division-benchmarks?sport=${encodeURIComponent(current.sport)}`)
      .then((res) => res.json())
      .then((benchmarks: DivisionBenchmark[]) => {
        if (cancelled) return;
        setFitScore(
          calculateFitScore(
            { sport: current.sport, gpa, stats: current.stats ?? {}, heightWeight, region },
            benchmarks
          )
        );
      })
      .finally(() => {
        if (!cancelled) setFitScoreLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="mt-6 border-t border-white/10 pt-6">
      <div className="flex flex-wrap gap-2">
        {entries.map((entry, i) => (
          <button
            key={`${entry.sport}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              i === active
                ? "border-transparent text-white"
                : "border-white/15 text-slate-400 hover:border-white/30 hover:text-white"
            )}
            style={i === active ? { backgroundColor: getSportAccent(entry.sport) } : undefined}
          >
            {entry.sport}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {current.positions && <Badge>{current.positions}</Badge>}
        {current.jerseyNumber && <Badge>#{current.jerseyNumber}</Badge>}
        {current.highlightUrl && (
          <a
            href={current.highlightUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            Watch Highlight Film
          </a>
        )}
      </div>

      {current.stats && Object.keys(current.stats).length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Reported Stats
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(current.stats).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/5 px-3 py-2">
                <div className="text-lg text-white">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {current.achievements && current.achievements.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Achievements
          </h3>
          <ul className="mt-3 space-y-1.5">
            {current.achievements.map((a) => (
              <li key={a} className="text-sm text-slate-300">
                &bull; {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fitScore && !fitScoreLoading && <FitScoreCard result={fitScore} />}
    </div>
  );
}
