"use client";

import { useState } from "react";
import type { ScoutingBoard } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function BoardTabs({
  boards,
  activeBoardId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  boards: ScoutingBoard[];
  activeBoardId: string;
  onSelect: (boardId: string) => void;
  onCreate: (name: string) => void;
  onRename: (boardId: string, name: string) => void;
  onDelete: (boardId: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {boards.map((b) =>
        renamingId === b.id ? (
          <form
            key={b.id}
            onSubmit={(e) => {
              e.preventDefault();
              if (renameValue.trim()) onRename(b.id, renameValue.trim());
              setRenamingId(null);
            }}
            className="flex items-center gap-1"
          >
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => setRenamingId(null)}
              className="h-9 w-40 py-1 text-sm"
            />
          </form>
        ) : (
          <div key={b.id} className="group relative">
            <button
              type="button"
              onClick={() => onSelect(b.id)}
              onDoubleClick={() => {
                setRenamingId(b.id);
                setRenameValue(b.name);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                activeBoardId === b.id
                  ? "border-electric-500 bg-electric-500/15 text-white"
                  : "border-white/15 text-slate-400 hover:border-white/30 hover:text-white"
              )}
            >
              {b.name}
            </button>
            {boards.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete board "${b.name}"?`)) onDelete(b.id);
                }}
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-navy-700 text-xs text-slate-400 hover:text-red-400 group-hover:flex"
                aria-label={`Delete ${b.name}`}
              >
                ×
              </button>
            )}
          </div>
        )
      )}

      {creating ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) {
              onCreate(newName.trim());
              setNewName("");
              setCreating(false);
            }
          }}
          className="flex items-center gap-2"
        >
          <Input
            autoFocus
            placeholder="Board name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => !newName && setCreating(false)}
            className="h-9 w-40 py-1 text-sm"
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full border border-dashed border-white/20 px-4 py-2 text-sm text-slate-400 hover:border-white/40 hover:text-white"
        >
          + New Board
        </button>
      )}
    </div>
  );
}
