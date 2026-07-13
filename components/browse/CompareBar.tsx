"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AthleteProfile } from "@/lib/types";
import { useCompare } from "@/lib/compare/CompareContext";
import { Button } from "@/components/ui/Button";

export function CompareBar() {
  const { selectedIds, clear } = useCompare();
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (selectedIds.length === 0) return;
    fetch("/api/athletes")
      .then((res) => res.json())
      .then((all: AthleteProfile[]) =>
        setAthletes(all.filter((a) => selectedIds.includes(a.id)))
      )
      .catch(() => {});
  }, [selectedIds]);

  // Redundant on the compare page itself -- it already shows the full
  // selection, and this floating bar would just overlap its content.
  if (selectedIds.length === 0 || pathname === "/compare") return null;

  return (
    <div className="fixed inset-x-0 z-[150] flex justify-center bottom-20 md:bottom-6 px-4">
      <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy-800 px-5 py-3 shadow-2xl shadow-black/40">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">
            Comparing {selectedIds.length}/3:
          </span>
          {selectedIds.map((id) => {
            const athlete = athletes.find((a) => a.id === id);
            return (
              <span
                key={id}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
              >
                {athlete?.name ?? "…"}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear all
          </button>
          <Button
            size="sm"
            disabled={selectedIds.length < 2}
            onClick={() => router.push("/compare")}
          >
            Compare Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
