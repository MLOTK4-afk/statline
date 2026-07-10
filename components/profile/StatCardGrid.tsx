import type { StatCard } from "@/lib/types";

export function StatCardGrid({ cards }: { cards: StatCard[] }) {
  if (!cards.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center"
        >
          <div className="font-heading text-2xl text-white">{card.value}</div>
          <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
