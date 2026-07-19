"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/Badge";
import type { Level } from "@/lib/types";
import { getAthleteTier } from "@/lib/tier";

export interface LivePreviewData {
  name: string;
  sport: string | null;
  level: Level | null;
  positions: string;
  jerseyNumber: string;
  region: string;
  statRows: { label: string; value: string }[];
  highlightUrl: string;
  achievements: string[];
  previousSeasonStats: string;
  combineFilled: boolean;
  endorsementQuote: string;
  /** Sport names only, from the Additional Sports editor -- enough for the
   * live preview to flip to Statline Legend as soon as a 2nd sport is added. */
  additionalSports: string[];
}

export function ProfileLivePreview({ data }: { data: LivePreviewData }) {
  const [pulsing, setPulsing] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const firstRender = useRef(true);
  const snapshot = JSON.stringify(data);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPulsing(true);
    setLabelVisible(true);
    const t1 = setTimeout(() => setPulsing(false), 700);
    const t2 = setTimeout(() => setLabelVisible(false), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const tier = getAthleteTier({
    highlightUrl: data.highlightUrl || undefined,
    achievements: data.achievements.filter((a) => a.trim()),
    previousSeasonStats: data.previousSeasonStats,
    stats: Object.fromEntries(
      data.statRows.filter((r) => r.label.trim()).map((r) => [r.label, r.value])
    ),
    region: data.region,
    endorsement: data.endorsementQuote.trim()
      ? { name: "", title: "", quote: data.endorsementQuote }
      : undefined,
    combine: data.combineFilled ? [{ label: "", value: "" }] : undefined,
    combineVerified: false,
    additionalSports: data.additionalSports.length
      ? data.additionalSports.map((s) => ({ sport: s }))
      : undefined,
  });

  const filledStats = data.statRows.filter((r) => r.label.trim());

  return (
    <div className="sticky top-24">
      <p
        className={`mb-2 text-center text-xs uppercase tracking-wider text-electric-500 transition-opacity duration-300 ${
          labelVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        &uarr; Preview updating live
      </p>
      <Card
        className={`relative overflow-hidden p-6 ${pulsing ? "animate-preview-pulse" : ""}`}
      >
        {data.jerseyNumber && (
          <div className="pointer-events-none absolute -right-2 -top-6 select-none font-heading text-[140px] font-bold leading-none text-white/5">
            #{data.jerseyNumber}
          </div>
        )}

        <div className="relative">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-3xl text-white">
              {data.name || "Your Name"}
            </h3>
            <TierBadge tier={tier} />
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {data.sport || "Sport"}
            {data.positions ? ` · ${data.positions}` : ""}
            {data.level ? ` · ${data.level.replace("-", " ")}` : ""}
          </p>

          {filledStats.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              {filledStats.slice(0, 4).map((row) => (
                <div
                  key={row.label}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center"
                >
                  <div className="font-heading text-lg text-white">
                    {row.value || "—"}
                  </div>
                  <div className="truncate text-[10px] uppercase tracking-wider text-slate-500">
                    {row.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
