"use client";

import { Input, Select } from "@/components/ui/Field";
import { LEVELS, SPORTS, US_REGIONS } from "@/lib/constants";

export interface Filters {
  q: string;
  sport: string;
  region: string;
  level: string;
  committed: string;
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
        className="lg:col-span-5"
      >
        <option value="">Committed &amp; Uncommitted</option>
        <option value="true">Committed Only</option>
        <option value="false">Uncommitted Only</option>
      </Select>
    </div>
  );
}
