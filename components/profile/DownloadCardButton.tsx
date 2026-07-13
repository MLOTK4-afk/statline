"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { AthleteProfile } from "@/lib/types";
import type { FitScoreResult } from "@/lib/fitScore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PlayerCard } from "@/components/profile/PlayerCard";

/**
 * Exports at pixelRatio ~2.7 so a 400x500 on-screen card becomes a clean
 * 1080x1350 PNG (Instagram's native portrait size) without needing a huge
 * DOM node.
 */
const EXPORT_PIXEL_RATIO = 2.7;

export function DownloadCardButton({
  athlete,
  fitScore,
  label = "Download Player Card",
  variant = "outline",
}: {
  athlete: AthleteProfile;
  fitScore?: FitScoreResult;
  label?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "outlineAccent";
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    setError(null);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: EXPORT_PIXEL_RATIO,
      });
      const link = document.createElement("a");
      const fileName = athlete.name
        ? `${athlete.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-statline-card.png`
        : "statline-card.png";
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("Couldn't generate the image. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} type="button">
        {label}
      </Button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="player-card-title">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-white/10 p-6">
            <h2 id="player-card-title" className="text-lg font-semibold text-white">
              Your Statline Player Card
            </h2>
            <p className="mt-1 text-sm text-skyline-300">
              Download it and post straight to your Instagram.
            </p>
            <div className="mt-5 flex justify-center overflow-x-auto">
              <PlayerCard ref={cardRef} athlete={athlete} fitScore={fitScore} />
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Preparing…" : "Download PNG"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
