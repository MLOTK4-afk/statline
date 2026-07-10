"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AthleteProfile } from "@/lib/types";
import { useCompare } from "@/lib/compare/CompareContext";
import { TierBadge } from "@/components/ui/Badge";
import { getAthleteTier } from "@/lib/tier";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

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

  const allStatLabels = Array.from(
    new Set(athletes.flatMap((a) => Object.keys(a.stats)))
  );

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

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-40 pb-4 text-xs uppercase tracking-wider text-slate-500">
                &nbsp;
              </th>
              {athletes.map((a) => (
                <th key={a.id} className="pb-4 pl-4">
                  <Link
                    href={`/athletes/${a.id}`}
                    className="font-heading text-xl text-white hover:text-skyline-300"
                  >
                    {a.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr>
              <td className="py-3 text-sm text-slate-500">Tier</td>
              {athletes.map((a) => (
                <td key={a.id} className="py-3 pl-4">
                  <TierBadge tier={getAthleteTier(a)} />
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 text-sm text-slate-500">Sport</td>
              {athletes.map((a) => (
                <td key={a.id} className="py-3 pl-4 text-sm text-slate-200">
                  {a.sport}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 text-sm text-slate-500">Level</td>
              {athletes.map((a) => (
                <td key={a.id} className="py-3 pl-4 text-sm text-slate-200">
                  {a.level.replace("-", " ")}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 text-sm text-slate-500">Region</td>
              {athletes.map((a) => (
                <td key={a.id} className="py-3 pl-4 text-sm text-slate-200">
                  {a.region}
                </td>
              ))}
            </tr>
            {allStatLabels.map((label) => (
              <tr key={label}>
                <td className="py-3 text-sm text-slate-500">{label}</td>
                {athletes.map((a) => (
                  <td key={a.id} className="py-3 pl-4 text-sm text-slate-200">
                    {a.stats[label] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
