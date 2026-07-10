import Link from "next/link";
import type { AthleteProfile } from "@/lib/types";
import { TierBadge } from "@/components/ui/Badge";
import { getAthleteTier } from "@/lib/tier";
import { cn } from "@/lib/cn";

const MEDAL_STYLES: Record<number, string> = {
  1: "border-[#D4AF37]/60 bg-[#D4AF37]/10",
  2: "border-[#C0C0C0]/60 bg-[#C0C0C0]/10",
  3: "border-[#CD7F32]/60 bg-[#CD7F32]/10",
};

const MEDAL_TEXT: Record<number, string> = {
  1: "text-[#D4AF37]",
  2: "text-[#C0C0C0]",
  3: "text-[#CD7F32]",
};

export function LeaderboardRow({
  rank,
  athlete,
}: {
  rank: number;
  athlete: AthleteProfile;
}) {
  return (
    <Link
      href={`/athletes/${athlete.id}`}
      className={cn(
        "flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:border-electric-500/50",
        MEDAL_STYLES[rank] ?? "border-white/10 bg-white/5"
      )}
    >
      <span
        className={cn(
          "font-heading text-xl",
          MEDAL_TEXT[rank] ?? "text-slate-500"
        )}
      >
        #{rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-lg text-white">
            {athlete.name}
          </span>
          <TierBadge tier={getAthleteTier(athlete)} />
        </div>
        <p className="truncate text-sm text-slate-400">
          {athlete.sport} &middot; {athlete.level.replace("-", " ")} &middot;{" "}
          {athlete.region}
        </p>
      </div>
      <span className="shrink-0 text-sm text-slate-500">
        {athlete.viewCount ?? 0} views
      </span>
    </Link>
  );
}
