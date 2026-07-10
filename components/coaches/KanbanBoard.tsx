"use client";

import { useState } from "react";
import Link from "next/link";
import type { AthleteProfile, BoardColumnKey, ScoutingBoard } from "@/lib/types";
import { BOARD_COLUMNS } from "@/lib/constants";
import { TierBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { NotesModal } from "@/components/coaches/NotesModal";
import { getAthleteTier } from "@/lib/tier";

export function KanbanBoard({
  board,
  boards,
  athletes,
  onMove,
  onNoteChange,
  onMoveToBoard,
  onRemove,
}: {
  board: ScoutingBoard;
  boards: ScoutingBoard[];
  athletes: Map<string, AthleteProfile>;
  onMove: (athleteId: string, toColumn: BoardColumnKey) => void;
  onNoteChange: (athleteId: string, note: string) => void;
  onMoveToBoard: (athleteId: string, toBoardId: string) => void;
  onRemove: (athleteId: string) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [noteTarget, setNoteTarget] = useState<{
    athleteId: string;
    name: string;
    note: string;
  } | null>(null);

  const totalCards = (Object.keys(board.columns) as BoardColumnKey[]).reduce(
    (sum, col) => sum + board.columns[col].length,
    0
  );

  if (totalCards === 0) {
    return (
      <EmptyState
        title="This board is empty"
        description="Add athletes from the browse directory to start tracking your recruiting pipeline."
        action={
          <Link
            href="/browse"
            className="text-sm font-semibold text-electric-500 hover:text-electric-600"
          >
            Browse athletes →
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BOARD_COLUMNS.map(({ key, label }) => {
          const columnKey = key as BoardColumnKey;
          const cards = board.columns[columnKey];
          return (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const athleteId = e.dataTransfer.getData("text/athlete-id");
                if (athleteId) onMove(athleteId, columnKey);
                setDragging(null);
              }}
              className="flex min-h-[200px] flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="font-heading text-sm uppercase tracking-wider text-slate-300">
                  {label}
                </h3>
                <span className="text-xs text-slate-500">{cards.length}</span>
              </div>

              {cards.map((card) => {
                const athlete = athletes.get(card.athleteId);
                return (
                  <div
                    key={card.athleteId}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/athlete-id", card.athleteId);
                      setDragging(card.athleteId);
                    }}
                    onDragEnd={() => setDragging(null)}
                    className={`cursor-grab rounded-lg border border-white/10 bg-navy-900 p-3 shadow-md active:cursor-grabbing ${
                      dragging === card.athleteId ? "opacity-50" : ""
                    }`}
                  >
                    {athlete ? (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/athletes/${athlete.id}`}
                            className="font-heading text-base text-white hover:text-skyline-300"
                          >
                            {athlete.name}
                          </Link>
                          <TierBadge tier={getAthleteTier(athlete)} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {athlete.sport} &middot; {athlete.region}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">Athlete unavailable</p>
                    )}

                    <div className="mt-2">
                      <Select
                        value={columnKey}
                        onChange={(e) =>
                          onMove(card.athleteId, e.target.value as BoardColumnKey)
                        }
                        className="!py-1 text-xs"
                      >
                        {BOARD_COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {boards.length > 1 && (
                      <div className="mt-2">
                        <Select
                          value={board.id}
                          onChange={(e) => {
                            if (e.target.value !== board.id) {
                              onMoveToBoard(card.athleteId, e.target.value);
                            }
                          }}
                          className="!py-1 text-xs"
                        >
                          {boards.map((b) => (
                            <option key={b.id} value={b.id}>
                              Move to: {b.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setNoteTarget({
                            athleteId: card.athleteId,
                            name: athlete?.name ?? "Athlete",
                            note: card.note ?? "",
                          })
                        }
                        className="text-xs text-skyline-300 hover:text-white"
                      >
                        {card.note ? "Edit note" : "+ Notes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(card.athleteId)}
                        className="text-xs text-slate-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    {card.note && (
                      <p className="mt-2 line-clamp-2 rounded bg-white/5 px-2 py-1 text-xs text-slate-400">
                        {card.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {noteTarget && (
        <NotesModal
          athleteName={noteTarget.name}
          initialNote={noteTarget.note}
          onClose={() => setNoteTarget(null)}
          onSave={(note) => onNoteChange(noteTarget.athleteId, note)}
        />
      )}
    </>
  );
}
