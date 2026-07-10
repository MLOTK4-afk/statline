import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { store } from "@/lib/storage";
import type { BoardColumnKey } from "@/lib/types";
import { BOARD_COLUMNS } from "@/lib/constants";
import { TierBadge } from "@/components/ui/Badge";
import { getAthleteTier } from "@/lib/tier";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Scouting Board | Statline",
};

export default async function SharedBoardPage({
  params,
}: {
  params: { token: string };
}) {
  const board = await store.getBoardByShareToken(params.token);
  if (!board) notFound();

  const allAthletes = await store.listAthletes();
  const athleteById = new Map(allAthletes.map((a) => [a.id, a]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
        You&apos;re viewing a read-only snapshot of a coach&apos;s scouting
        board.
      </div>

      <h1 className="mt-6 text-4xl text-white">{board.name}</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BOARD_COLUMNS.map(({ key, label }) => {
          const columnKey = key as BoardColumnKey;
          const cards = board.columns[columnKey];
          return (
            <div
              key={key}
              className="flex min-h-[160px] flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="font-heading text-sm uppercase tracking-wider text-slate-300">
                  {label}
                </h3>
                <span className="text-xs text-slate-500">{cards.length}</span>
              </div>
              {cards.map((card) => {
                const athlete = athleteById.get(card.athleteId);
                if (!athlete) return null;
                return (
                  <Link
                    key={card.athleteId}
                    href={`/athletes/${athlete.id}`}
                    className="rounded-lg border border-white/10 bg-navy-900 p-3 hover:border-electric-500/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-heading text-base text-white">
                        {athlete.name}
                      </span>
                      <TierBadge tier={getAthleteTier(athlete)} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {athlete.sport} &middot; {athlete.region}
                    </p>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
