import { cn } from "@/lib/cn";
import type { Tier } from "@/lib/types";
import { TIER_LABEL } from "@/lib/tier";

const tierStyles: Record<Tier, string> = {
  Bronze: "bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/50",
  Silver: "bg-[#C0C0C0]/20 text-[#C0C0C0] border-[#C0C0C0]/50",
  Gold: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50",
  Elite:
    "bg-gradient-to-r from-violet-500/25 to-pink-500/25 text-fuchsia-300 border-fuchsia-400/50 shadow-[0_0_10px_rgba(217,70,239,0.6)]",
  Legend: "pill-glow-legend",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-heading uppercase tracking-wider",
        tierStyles[tier]
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300",
        className
      )}
    >
      {children}
    </span>
  );
}
