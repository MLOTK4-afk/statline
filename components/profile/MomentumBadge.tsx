import { cn } from "@/lib/cn";
import type { MomentumLabel } from "@/lib/momentum";

const styles: Record<MomentumLabel, string> = {
  Rising: "bg-green-500/20 text-green-400 border-green-500/50",
  Steady: "bg-electric-500/20 text-electric-500 border-electric-500/50",
  Cooling: "bg-white/10 text-slate-400 border-white/20",
};

const arrow: Record<MomentumLabel, string> = {
  Rising: "↑",
  Steady: "→",
  Cooling: "↓",
};

export function MomentumBadge({
  label,
  trendPercent,
  className,
}: {
  label: MomentumLabel;
  trendPercent: number;
  className?: string;
}) {
  return (
    <span
      title={`${trendPercent > 0 ? "+" : ""}${trendPercent}% activity vs. the prior 14 days`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[label],
        className
      )}
    >
      <span aria-hidden>{arrow[label]}</span>
      {label}
    </span>
  );
}
