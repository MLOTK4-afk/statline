"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { AthleteProfile, BoardColumnKey, ScoutingBoard } from "@/lib/types";
import { KanbanBoard } from "@/components/coaches/KanbanBoard";
import { AddAthleteSearch } from "@/components/coaches/AddAthleteSearch";
import { BoardTabs } from "@/components/coaches/BoardTabs";
import { ShareBoardButton } from "@/components/coaches/ShareBoardButton";
import { LinkButton } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/ToastContext";

export default function CoachesPage() {
  const { status } = useSession();
  const { showToast } = useToast();
  const [boards, setBoards] = useState<ScoutingBoard[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);

  const loadBoards = useCallback(() => {
    fetch("/api/boards")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ScoutingBoard[]) => {
        setBoards(data);
        setActiveBoardId((current) =>
          current && data.some((b) => b.id === current) ? current : data[0]?.id ?? null
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadBoards();
    fetch("/api/athletes")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => {});
  }, [status, loadBoards]);

  const athleteMap = useMemo(
    () => new Map(athletes.map((a) => [a.id, a])),
    [athletes]
  );

  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null;

  async function addAthlete(athleteId: string) {
    if (!activeBoardId) return;
    const res = await fetch(`/api/boards/${activeBoardId}/athletes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      showToast("Athlete added to board");
    }
  }

  async function moveAthlete(athleteId: string, toColumn: BoardColumnKey) {
    if (!activeBoardId) return;
    const res = await fetch(`/api/boards/${activeBoardId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId, toColumn }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  }

  async function updateNote(athleteId: string, note: string) {
    if (!activeBoardId) return;
    const res = await fetch(`/api/boards/${activeBoardId}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId, note }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      showToast("Note saved");
    }
  }

  async function removeAthlete(athleteId: string) {
    if (!activeBoardId) return;
    const res = await fetch(`/api/boards/${activeBoardId}/athletes/${athleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const updated = await res.json();
      setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  }

  async function moveToBoard(athleteId: string, toBoardId: string) {
    if (!activeBoardId) return;
    const res = await fetch(`/api/boards/${activeBoardId}/move-to`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId, toBoardId }),
    });
    if (res.ok) {
      setBoards(await res.json());
      showToast("Athlete moved");
    }
  }

  async function createBoard(name: string) {
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const created = await res.json();
      setBoards((prev) => [...prev, created]);
      setActiveBoardId(created.id);
    }
  }

  async function renameBoard(boardId: string, name: string) {
    const res = await fetch(`/api/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  }

  async function deleteBoard(boardId: string) {
    const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
    if (res.ok) loadBoards();
  }

  async function toggleShare(enabled: boolean) {
    if (!activeBoardId) return null;
    const res = await fetch(`/api/boards/${activeBoardId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) return null;
    const updated = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    return updated;
  }

  if (status === "loading") {
    return <div className="px-4 py-24 text-center text-slate-500">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-3xl text-white">Sign in to scout</h1>
        <p className="mt-2 text-slate-400">
          Coaches need an account to build a scouting board and track
          athletes through the recruiting pipeline.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton href="/login">Sign In</LinkButton>
          <LinkButton href="/register" variant="outline">
            Create Account
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Scouting Boards</h1>
          <p className="mt-1 text-slate-400">
            Drag athletes between stages as your recruiting conversations
            progress.
          </p>
        </div>
        {activeBoard && (
          <ShareBoardButton board={activeBoard} onToggle={toggleShare} />
        )}
      </div>

      <div className="mt-6">
        <BoardTabs
          boards={boards}
          activeBoardId={activeBoardId ?? ""}
          onSelect={setActiveBoardId}
          onCreate={createBoard}
          onRename={renameBoard}
          onDelete={deleteBoard}
        />
      </div>

      <div className="mt-6 max-w-lg">
        <AddAthleteSearch athletes={athletes} onAdd={addAthlete} />
      </div>

      <div className="mt-8">
        {activeBoard ? (
          <KanbanBoard
            board={activeBoard}
            boards={boards}
            athletes={athleteMap}
            onMove={moveAthlete}
            onNoteChange={updateNote}
            onMoveToBoard={moveToBoard}
            onRemove={removeAthlete}
          />
        ) : (
          <p className="text-slate-500">Loading board...</p>
        )}
      </div>
    </div>
  );
}
