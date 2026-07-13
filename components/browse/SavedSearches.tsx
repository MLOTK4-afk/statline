"use client";

import { useEffect, useState } from "react";
import type { SavedSearch } from "@/lib/types";
import type { Filters } from "@/components/browse/FilterBar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/ToastContext";

export function SavedSearches({
  filters,
  onApply,
}: {
  filters: Filters;
  onApply: (filters: Filters) => void;
}) {
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setSaved(user?.savedSearches ?? []))
      .catch(() => {});
  }, []);

  const hasActiveFilters = Object.values(filters).some((v) => v);

  async function saveCurrentSearch() {
    const name = window.prompt("Name this search:");
    if (!name) return;
    const res = await fetch("/api/users/me/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters }),
    });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.savedSearches);
      showToast("Search saved");
    }
  }

  async function removeSearch(id: string) {
    const res = await fetch(`/api/users/me/saved-searches/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.savedSearches);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {saved.map((s) => (
        <div
          key={s.id}
          className="group flex items-center gap-1 rounded-full border border-white/15 bg-white/5 pl-3 pr-1 py-1 text-xs text-slate-300"
        >
          <button
            type="button"
            onClick={() =>
              onApply({
                q: s.filters.q ?? "",
                sport: s.filters.sport ?? "",
                region: s.filters.region ?? "",
                level: s.filters.level ?? "",
                committed: s.filters.committed ?? "",
                minFitScore: s.filters.minFitScore ?? "",
              })
            }
            className="hover:text-white"
          >
            {s.name}
          </button>
          <button
            type="button"
            onClick={() => removeSearch(s.id)}
            className="ml-1 rounded-full px-1 text-slate-500 hover:text-red-400"
            aria-label={`Remove saved search ${s.name}`}
          >
            ×
          </button>
        </div>
      ))}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={saveCurrentSearch}>
          + Save this search
        </Button>
      )}
    </div>
  );
}
