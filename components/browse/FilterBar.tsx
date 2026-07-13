"use client";

import { Input, Select } from "@/components/ui/Field";
import { LEVELS, SPORTS, US_REGIONS } from "@/lib/constants";

export interface Filters {
  q: string;
  sport: string;
  region: string;
  level: string;
  committed: string;
  /** Empty string means no minimum applied; otherwise "0"-"100". */
  minFitScore: string;
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        placeholder="Search by name, sport, or region"
        value={filters.q}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
        className="lg:col-span-2"
      />
      <Select
        value={filters.sport}
        onChange={(e) => onChange({ ...filters, sport: e.target.value })}
      >
        <option value="">All Sports</option>
        {SPORTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select
        value={filters.region}
        onChange={(e) => onChange({ ...filters, region: e.target.value })}
      >
        <option value="">All Regions</option>
        {US_REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>
      <Select
        value={filters.level}
        onChange={(e) => onChange({ ...filters, level: e.target.value })}
      >
        <option value="">All Levels</option>
        {LEVELS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </Select>
      <Select
        value={filters.committed}
        onChange={(e) => onChange({ ...filters, committed: e.target.value })}
      >
        <option value="">Committed &amp; Uncommitted</option>
        <option value="true">Committed Only</option>
        <option value="false">Uncommitted Only</option>
      </Select>

      <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2 lg:col-span-4">
        <label htmlFor="min-fit-score" className="shrink-0 text-sm text-slate-400">
          Minimum Fit Score
        </label>
        <input
          id="min-fit-score"
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minFitScore || 0}
          onChange={(e) => onChange({ ...filters, minFitScore: e.target.value })}
          className="w-full accent-electric-500"
        />
        <span className="shrink-0 text-sm font-semibold text-white">
          {filters.minFitScore || 0}
        </span>
        {filters.minFitScore && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, minFitScore: "" })}
            className="shrink-0 text-xs font-semibold text-electric-500 hover:text-electric-600"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
