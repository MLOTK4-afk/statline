"use client";

import { cn } from "@/lib/cn";
import { INTERNATIONAL_SPORTS } from "@/lib/constants";

export function SportTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (sport: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {INTERNATIONAL_SPORTS.map((sport) => (
        <button
          key={sport}
          type="button"
          onClick={() => onChange(sport)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === sport
              ? "border-intl-500 bg-intl-500/15 text-white"
              : "border-white/15 text-slate-400 hover:border-white/30 hover:text-white"
          )}
        >
          {sport}
        </button>
      ))}
    </div>
  );
}
