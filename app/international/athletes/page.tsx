"use client";

import { useEffect, useMemo, useState } from "react";
import type { AthleteProfile } from "@/lib/types";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

interface IntlFilters {
  q: string;
  country: string;
  position: string;
  entryYear: string;
}

const EMPTY_FILTERS: IntlFilters = {
  q: "",
  country: "",
  position: "",
  entryYear: "",
};

export default function InternationalAthletesPage() {
  const [athletes, setAthletes] = useState<AthleteProfile[] | null>(null);
  const [filters, setFilters] = useState<IntlFilters>(EMPTY_FILTERS);

  useEffect(() => {
    fetch("/api/athletes?international=true")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, []);

  const countries = useMemo(() => {
    const set = new Set(
      (athletes ?? [])
        .map((a) => a.international?.homeCountry)
        .filter((c): c is string => !!c)
    );
    return Array.from(set).sort();
  }, [athletes]);

  const entryYears = useMemo(() => {
    const set = new Set(
      (athletes ?? [])
        .map((a) => a.international?.entryYear)
        .filter((y): y is string => !!y)
    );
    return Array.from(set).sort();
  }, [athletes]);

  const filtered = useMemo(() => {
    if (!athletes) return [];
    const needle = filters.q.trim().toLowerCase();
    return athletes.filter((a) => {
      if (filters.country && a.international?.homeCountry !== filters.country)
        return false;
      if (
        filters.position &&
        !(a.positions ?? "").toLowerCase().includes(filters.position.toLowerCase())
      )
        return false;
      if (filters.entryYear && a.international?.entryYear !== filters.entryYear)
        return false;
      if (
        needle &&
        !`${a.name} ${a.sport} ${a.international?.homeCountry ?? ""}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [athletes, filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl text-white">International Athlete Directory</h1>
      <p className="mt-1 text-slate-400">
        Browse international athletes by country, position, and entry year.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Search by name, sport, country..."
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-intl-500 focus:outline-none focus:ring-1 focus:ring-intl-500"
        />
        <Select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <input
          type="text"
          value={filters.position}
          onChange={(e) => setFilters({ ...filters, position: e.target.value })}
          placeholder="Position"
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-intl-500 focus:outline-none focus:ring-1 focus:ring-intl-500"
        />
        <Select
          value={filters.entryYear}
          onChange={(e) => setFilters({ ...filters, entryYear: e.target.value })}
        >
          <option value="">All Entry Years</option>
          {entryYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        {athletes === null ? (
          <p className="text-slate-500">Loading athletes...</p>
        ) : athletes.length === 0 ? (
          <EmptyState
            title="No international athletes have published a profile yet"
            description="Be the first."
            action={
              <LinkButton href="/international/build-profile" variant="accent" size="sm">
                Build My Profile
              </LinkButton>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No athletes match your filters"
            description="Try adjusting or clearing your search and filters."
            action={
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-sm font-semibold text-intl-500 hover:text-intl-600"
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
