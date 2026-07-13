"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AthleteProfile } from "@/lib/types";
import { useCompare } from "@/lib/compare/CompareContext";
import { TierBadge, Badge } from "@/components/ui/Badge";
import { getAthleteTier } from "@/lib/tier";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { CompareBarChart, type CompareBarEntry } from "@/components/compare/CompareBarChart";

/** Fixed order, validated for CVD separation + contrast against navy-900 (see dataviz skill). Slot 1 matches the existing brand blue. */
const ATHLETE_COLORS = ["#3B82F6", "#199e70", "#c98500"];

function parseNumeric(value: string): number | null {
  const parsed = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

export default function ComparePage() {
  const { selectedIds, clear } = useCompare();
  const [athletes, setAthletes] = useState<AthleteProfile[] | null>(null);

  useEffect(() => {
    fetch("/api/athletes")
      .then((res) => res.json())
      .then((all: AthleteProfile[]) =>
        setAthletes(all.filter((a) => selectedIds.includes(a.id)))
      )
      .catch(() => setAthletes([]));
  }, [selectedIds]);

  const colorByAthlete = useMemo(() => {
    const map = new Map<string, string>();
    (athletes ?? []).forEach((a, i) => map.set(a.id, ATHLETE_COLORS[i]));
    return map;
  }, [athletes]);

  const { sharedGpaChart, sharedStatCharts, uniqueStatsByAthlete } = useMemo(() => {
    if (!athletes) {
      return {
        sharedGpaChart: null as CompareBarEntry[] | null,
        sharedStatCharts: [] as { label: string; entries: CompareBarEntry[] }[],
        uniqueStatsByAthlete: new Map<string, [string, string][]>(),
      };
    }

    const gpaEntries: CompareBarEntry[] = athletes
      .map((a) => {
        const value = a.gpa ? parseNumeric(a.gpa) : null;
        return value === null
          ? null
          : { name: a.name, value, displayValue: a.gpa!, color: colorByAthlete.get(a.id)! };
      })
      .filter((e): e is CompareBarEntry => e !== null);
    const sharedGpaChart = gpaEntries.length >= 2 ? gpaEntries : null;

    const allLabels = Array.from(new Set(athletes.flatMap((a) => Object.keys(a.stats))));
    const sharedStatCharts: { label: string; entries: CompareBarEntry[] }[] = [];
    const uniqueStatsByAthlete = new Map<string, [string, string][]>();
    athletes.forEach((a) => uniqueStatsByAthlete.set(a.id, []));

    for (const label of allLabels) {
      const entries: CompareBarEntry[] = [];
      const nonNumericAthletes: AthleteProfile[] = [];
      for (const a of athletes) {
        const raw = a.stats[label];
        if (raw === undefined) continue;
        const value = parseNumeric(raw);
        if (value !== null) {
          entries.push({ name: a.name, value, displayValue: raw, color: colorByAthlete.get(a.id)! });
        } else {
          nonNumericAthletes.push(a);
        }
      }
      // Chart it if at least 2 athletes have a numeric value -- an athlete
      // whose value didn't parse still gets it listed under "Other Stats"
      // rather than silently dropped.
      if (entries.length >= 2) {
        sharedStatCharts.push({ label, entries });
        for (const a of nonNumericAthletes) {
          uniqueStatsByAthlete.get(a.id)!.push([label, a.stats[label]]);
        }
      } else {
        for (const a of athletes) {
          if (a.stats[label] !== undefined) {
            uniqueStatsByAthlete.get(a.id)!.push([label, a.stats[label]]);
          }
        }
      }
    }

    return { sharedGpaChart, sharedStatCharts, uniqueStatsByAthlete };
  }, [athletes, colorByAthlete]);

  if (selectedIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Nothing to compare yet"
          description="Select up to 3 athletes from the browse directory to compare them side by side."
          action={<LinkButton href="/browse">Browse Athletes</LinkButton>}
        />
      </div>
    );
  }

  if (!athletes) {
    return <p className="px-4 py-16 text-center text-slate-500">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl text-white">Compare Athletes</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-slate-400 hover:text-white"
        >
          Clear all
        </button>
      </div>

      {/* Identity header -- also serves as the persistent legend for every chart below */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {athletes.map((a) => (
          <Card key={a.id} className="p-5" style={{ borderTopColor: colorByAthlete.get(a.id), borderTopWidth: 3 }}>
            <div className="flex items-start gap-2">
              <span
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorByAthlete.get(a.id) }}
                aria-hidden
              />
              <div>
                <Link
                  href={`/athletes/${a.id}`}
                  className="font-heading text-xl text-white hover:text-skyline-300"
                >
                  {a.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate-400">
                  {a.sport} &middot; {a.region}
                  {a.gradYear ? ` · Class of ${a.gradYear}` : ""}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <TierBadge tier={getAthleteTier(a)} />
              <Badge>{a.level.replace("-", " ")}</Badge>
              {a.gpa && <Badge>GPA {a.gpa}</Badge>}
              {a.committed ? (
                <Badge className="border-electric-500/40 text-electric-500">
                  Committed{a.committedSchool ? ` — ${a.committedSchool}` : ""}
                </Badge>
              ) : (
                <Badge>Uncommitted</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Comparative charts -- only for stats every selected athlete reported, so a chart never implies a missing value is zero */}
      {(sharedGpaChart || sharedStatCharts.length > 0) && (
        <Card className="mt-8 p-6">
          <h2 className="font-heading text-lg text-white">Head-to-Head Stats</h2>
          <p className="mt-1 text-xs text-slate-500">
            Bars compare raw reported values, not who&apos;s &ldquo;better&rdquo;
            — direction (higher vs. lower is best) varies by stat.
          </p>
          <div className="mt-5 space-y-5">
            {sharedGpaChart && <CompareBarChart label="GPA" entries={sharedGpaChart} />}
            {sharedStatCharts.map(({ label, entries }) => (
              <CompareBarChart key={label} label={label} entries={entries} />
            ))}
          </div>
        </Card>
      )}

      {/* Stats only some athletes reported -- kept visible per-athlete rather than dropped */}
      {athletes.some((a) => (uniqueStatsByAthlete.get(a.id) ?? []).length > 0) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((a) => {
            const unique = uniqueStatsByAthlete.get(a.id) ?? [];
            if (unique.length === 0) return null;
            return (
              <Card key={a.id} className="p-5">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">
                  {a.name.split(" ")[0]}&apos;s Other Stats
                </h3>
                <div className="mt-3 space-y-1.5">
                  {unique.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Achievements */}
      {athletes.some((a) => a.achievements.length > 0) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((a) => (
            <Card key={a.id} className="p-5">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">
                Achievements
              </h3>
              {a.achievements.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {a.achievements.map((ach) => (
                    <li key={ach} className="text-sm text-slate-300">
                      &bull; {ach}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600">None reported.</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Scouting reports side by side -- the qualitative "description" a coach actually reads */}
      {athletes.some((a) => a.scoutingReport) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((a) => (
            <Card key={a.id} className="p-5">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">
                Scouting Report
              </h3>
              {a.scoutingReport ? (
                <div className="mt-3">
                  <p className="font-heading text-base italic text-skyline-300">
                    &ldquo;{a.scoutingReport.tagline}&rdquo;
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {a.scoutingReport.summary}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  No scouting report yet.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
