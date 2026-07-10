"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AthleteProfile } from "@/lib/types";
import { TierBadge } from "@/components/ui/Badge";
import { getAthleteTier } from "@/lib/tier";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [athletes, setAthletes] = useState<AthleteProfile[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || athletes !== null) return;
    fetch("/api/athletes")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, [open, athletes]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const needle = query.trim().toLowerCase();
  const results =
    needle && athletes
      ? athletes
          .filter((a) =>
            `${a.name} ${a.sport} ${a.region}`.toLowerCase().includes(needle)
          )
          .slice(0, 8)
      : [];

  function goToProfile(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/athletes/${id}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search athletes"
        className="flex items-center justify-center rounded-md p-2 text-slate-300 transition-colors hover:text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-white/10 bg-navy-800 p-3 shadow-xl">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athletes by name, sport, or region..."
            className="w-full rounded-md border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-skyline-300 focus:outline-none"
          />

          <div className="mt-2 max-h-80 overflow-y-auto">
            {!needle ? (
              <p className="px-1 py-3 text-sm text-slate-500">
                Start typing to search the directory.
              </p>
            ) : athletes === null ? (
              <p className="px-1 py-3 text-sm text-slate-500">Searching...</p>
            ) : results.length === 0 ? (
              <p className="px-1 py-3 text-sm text-slate-500">
                No athletes match &ldquo;{query}&rdquo;.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {results.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => goToProfile(a.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-white/5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">
                          {a.name}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {a.sport} &middot; {a.region}
                        </span>
                      </span>
                      <TierBadge tier={getAthleteTier(a)} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
