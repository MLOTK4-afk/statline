"use client";

import { useEffect, useState } from "react";
import type { ScoutingBoard } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/ToastContext";

export function ShareBoardButton({
  board,
  onToggle,
}: {
  board: ScoutingBoard;
  onToggle: (enabled: boolean) => Promise<ScoutingBoard | null>;
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const shareUrl =
    board.shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/coaches/shared/${board.shareToken}`
      : null;

  async function handleClick() {
    if (!board.shareToken) {
      await onToggle(true);
    }
    setOpen(true);
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={handleClick}>
        Share
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-white/10 bg-navy-800 p-4 shadow-xl">
          <p className="text-xs text-slate-400">
            Anyone with this link can view this board — they can&apos;t edit
            it.
          </p>
          {shareUrl && (
            <div className="mt-3 flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="w-full truncate rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-slate-300"
              />
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  showToast("Link copied to clipboard");
                }}
              >
                Copy
              </Button>
            </div>
          )}
          <div className="mt-3 flex justify-between">
            <button
              type="button"
              onClick={async () => {
                await onToggle(false);
                setOpen(false);
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Stop sharing
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
