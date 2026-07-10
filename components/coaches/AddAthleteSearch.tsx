"use client";

import { useMemo, useState } from "react";
import type { AthleteProfile } from "@/lib/types";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AddAthleteSearch({
  athletes,
  onAdd,
}: {
  athletes: AthleteProfile[];
  onAdd: (athleteId: string) => void;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return athletes
      .filter((a) => `${a.name} ${a.sport} ${a.region}`.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [athletes, query]);

  return (
    <div className="relative">
      <Input
        placeholder="Search athletes to add to your board..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {matches.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-white/10 bg-navy-800 shadow-xl">
          {matches.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2 last:border-0"
            >
              <div>
                <p className="text-sm text-white">{a.name}</p>
                <p className="text-xs text-slate-400">
                  {a.sport} &middot; {a.region}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onAdd(a.id);
                  setQuery("");
                }}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
