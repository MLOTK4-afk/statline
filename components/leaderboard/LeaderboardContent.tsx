"use client";

import { useEffect, useMemo, useState } from "react";
import type { AthleteProfile } from "@/lib/types";
import { SPORTS } from "@/lib/constants";
import { TIER_RANK, getAthleteTier } from "@/lib/tier";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { PhotoHeader } from "@/components/ui/PhotoHeader";
import { Reveal } from "@/components/ui/Reveal";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";

type SortMode = "tier" | "views";

export function LeaderboardContent() {
  const [athletes, setAthletes] = useState<AthleteProfile[] | null>(null);
  const [sport, setSport] = useState("");
  const [sort, setSort] = useState<SortMode>("tier");

  useEffect(() => {
    fetch("/api/athletes?international=false")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, []);

  const ranked = useMemo(() => {
    if (!athletes) return [];
    return athletes
      .filter((a) => !sport || a.sport === sport)
      .sort((a, b) => {
        if (sort === "views") {
          return (b.viewCount ?? 0) - (a.viewCount ?? 0);
        }
        const tierDiff = TIER_RANK[getAthleteTier(b)] - TIER_RANK[getAthleteTier(a)];
        if (tierDiff !== 0) return tierDiff;
        return (b.viewCount ?? 0) - (a.viewCount ?? 0);
      });
  }, [athletes, sport, sort]);

  return (
    <div>
      <PhotoHeader
        eyebrow="Rankings"
        title={<span className="text-gradient-flare">Leaderboard</span>}
        subtitle="Ranked by Statline tier and profile views."
        photoUrl="/images/leaderboard-football.jpg"
        photoPosition="center 55%"
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <Select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="">All Sports</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
            <option value="tier">Sort by Tier</option>
            <option value="views">Sort by Views</option>
          </Select>
        </div>

        <Reveal className="mt-8">
          {athletes === null ? (
            <p className="text-slate-500">Loading...</p>
          ) : ranked.length === 0 ? (
            <EmptyState
              title="No rankings yet"
              description="Leaderboards will populate once real athletes publish profiles."
              action={
                <LinkButton href="/athletes/example" variant="outline" size="sm">
                  See an example profile
                </LinkButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {ranked.map((athlete, idx) => (
                <LeaderboardRow key={athlete.id} rank={idx + 1} athlete={athlete} />
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
