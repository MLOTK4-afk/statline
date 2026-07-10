"use client";

import { useEffect, useMemo, useState } from "react";
import type { AthleteProfile } from "@/lib/types";
import { FilterBar, type Filters } from "@/components/browse/FilterBar";
import { SavedSearches } from "@/components/browse/SavedSearches";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

const EMPTY_FILTERS: Filters = {
  q: "",
  sport: "",
  region: "",
  level: "",
  committed: "",
};

export default function BrowsePage() {
  const [athletes, setAthletes] = useState<AthleteProfile[] | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  useEffect(() => {
    fetch("/api/athletes?international=false")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, []);

  const filtered = useMemo(() => {
    if (!athletes) return [];
    const needle = filters.q.trim().toLowerCase();
    return athletes.filter((a) => {
      if (filters.sport && a.sport !== filters.sport) return false;
      if (filters.region && a.region !== filters.region) return false;
      if (filters.level && a.level !== filters.level) return false;
      if (filters.committed === "true" && !a.committed) return false;
      if (filters.committed === "false" && a.committed) return false;
      if (
        needle &&
        !`${a.name} ${a.sport} ${a.region}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [athletes, filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl text-white">Browse Athletes</h1>
      <p className="mt-1 text-slate-400">
        Search and filter the full Statline athlete directory.
      </p>

      <div className="mt-8">
        <SavedSearches filters={filters} onApply={setFilters} />
      </div>

      <div className="mt-4">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-8">
        {athletes === null ? (
          <p className="text-slate-500">Loading athletes...</p>
        ) : athletes.length === 0 ? (
          <EmptyState
            title="No athletes have published a profile yet"
            description="Be the first."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <LinkButton href="/build-profile" size="sm">
                  Build My Profile
                </LinkButton>
                <LinkButton href="/athletes/example" variant="outline" size="sm">
                  See an example profile
                </LinkButton>
              </div>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No athletes match your filters"
            description="Try adjusting or clearing your search and filters."
            action={
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-sm font-semibold text-electric-500 hover:text-electric-600"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((athlete) => (
              <ProfileCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
