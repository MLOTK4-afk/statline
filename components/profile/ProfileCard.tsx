"use client";

import Link from "next/link";
import type { AthleteProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { MomentumBadgeClient } from "@/components/profile/MomentumBadgeClient";
import { getAthleteTier } from "@/lib/tier";
import { getSportAccent } from "@/lib/sportTheme";
import { useCompare } from "@/lib/compare/CompareContext";
import { cn } from "@/lib/cn";

export function ProfileCard({ athlete }: { athlete: AthleteProfile }) {
  const topStats = Object.entries(athlete.stats).slice(0, 3);
  const { toggle, isSelected, isFull } = useCompare();
  const selected = isSelected(athlete.id);
  // "80" suffix bakes ~50% alpha into the hex so the Tailwind arbitrary
  // color value doesn't need an opacity modifier (which can't compute alpha
  // from a CSS var() at build time).
  const hoverAccent = `${getSportAccent(athlete.sport)}80`;

  return (
    <Link href={`/athletes/${athlete.id}`} className="group block">
      <Card
        className="relative h-full overflow-hidden p-5 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-[var(--hover-accent)]"
        style={{ ["--hover-accent" as string]: hoverAccent }}
      >
        {athlete.bannerUrl && (
          <div
            className="-mx-5 -mt-5 mb-4 h-32 bg-cover bg-top"
            style={{ backgroundImage: `url(${athlete.bannerUrl})` }}
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading text-2xl leading-tight text-white">
              {athlete.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">
              {athlete.sport} &middot; {athlete.region}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <TierBadge tier={getAthleteTier(athlete)} />
            {!athlete.isExample && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle(athlete.id);
                }}
                disabled={!selected && isFull}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
                  selected
                    ? "border-electric-500 bg-electric-500 text-white"
                    : "border-white/20 bg-navy-900/70 text-slate-300 hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {selected ? "✓ Compare" : "Compare"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{athlete.level.replace("-", " ")}</Badge>
          {!athlete.isExample && <MomentumBadgeClient athleteId={athlete.id} />}
          {athlete.committed ? (
            <Badge className="border-electric-500/40 text-electric-500">
              Committed{athlete.committedSchool ? ` — ${athlete.committedSchool}` : ""}
            </Badge>
          ) : (
            <Badge>Uncommitted</Badge>
          )}
          {athlete.isInternational && <Badge>International</Badge>}
        </div>

        {topStats.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            {topStats.map(([label, value]) => (
              <div key={label} className="text-center">
                <div className="font-heading text-lg text-white">{value}</div>
                <div className="truncate text-[10px] uppercase tracking-wider text-slate-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {athlete.scoutingReport?.tagline && (
          <p className="mt-4 line-clamp-2 text-sm italic text-skyline-300">
            &ldquo;{athlete.scoutingReport.tagline}&rdquo;
          </p>
        )}

        {athlete.targetSchools && athlete.targetSchools.length > 0 && (
          <p className="mt-3 truncate text-xs text-slate-500">
            Targeting: {athlete.targetSchools.join(", ")}
          </p>
        )}
      </Card>
    </Link>
  );
}
