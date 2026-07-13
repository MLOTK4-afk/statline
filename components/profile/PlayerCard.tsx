import { forwardRef } from "react";
import type { AthleteProfile } from "@/lib/types";
import type { FitScoreResult } from "@/lib/fitScore";
import { getAthleteTier } from "@/lib/tier";
import { TIER_LABEL } from "@/lib/tier";
import { getSportAccent } from "@/lib/sportTheme";

/**
 * The exportable "flex card" -- rendered at a fixed 400x500 (4:5, Instagram
 * native) and exported via html-to-image at a high pixelRatio so the PNG
 * comes out ~1080x1350 without needing a huge on-screen DOM node. Kept to
 * inline styles + plain data (no photo fetches) so html-to-image never hits
 * a cross-origin image it can't read.
 */
export const PlayerCard = forwardRef<
  HTMLDivElement,
  { athlete: AthleteProfile; fitScore?: FitScoreResult }
>(function PlayerCard({ athlete, fitScore }, ref) {
  const accent = getSportAccent(athlete.sport);
  const tier = getAthleteTier(athlete);

  const statEntries = Object.entries(athlete.stats).slice(0, 2);
  const tiles: { label: string; value: string }[] = [];
  if (athlete.gpa) tiles.push({ label: "GPA", value: athlete.gpa });
  if (fitScore) tiles.push({ label: "Fit Score", value: `${fitScore.score}` });
  for (const [label, value] of statEntries) {
    if (tiles.length >= 4) break;
    tiles.push({ label, value });
  }
  if (tiles.length < 3 && athlete.heightWeight) {
    tiles.push({ label: "Size", value: athlete.heightWeight });
  }

  return (
    <div
      ref={ref}
      style={{
        width: 400,
        height: 500,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-inter), sans-serif",
        color: "#fff",
        backgroundColor: "#0F172A",
        backgroundImage: `linear-gradient(160deg, #141c33 0%, #0f172a 70%, #0a1224 100%)`,
        borderTop: `6px solid ${accent}`,
        borderRadius: 20,
        padding: "28px 30px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-big-shoulders), sans-serif",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#93C5FD",
          }}
        >
          Statline
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: `1.5px solid ${accent}`,
            color: accent,
            backgroundColor: `${accent}22`,
          }}
        >
          {TIER_LABEL[tier]}
        </span>
      </div>

      <div style={{ marginTop: 26 }}>
        <div
          style={{
            fontFamily: "var(--font-big-shoulders), sans-serif",
            fontWeight: 900,
            fontSize: 34,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {athlete.name}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#94A3B8" }}>
          {athlete.sport}
          {athlete.positions ? ` · ${athlete.positions}` : ""}
        </div>
        <div style={{ marginTop: 2, fontSize: 13, color: "#64748B" }}>
          {athlete.team || athlete.region}
          {athlete.gradYear ? ` · Class of ${athlete.gradYear}` : ""}
        </div>
      </div>

      {tiles.length > 0 && (
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(tiles.length, 3)}, 1fr)`,
            gap: 10,
          }}
        >
          {tiles.slice(0, 3).map((t) => (
            <div
              key={t.label}
              style={{
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: "12px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-big-shoulders), sans-serif", fontWeight: 800, fontSize: 20 }}>
                {t.value}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#64748B",
                }}
              >
                {t.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {athlete.committed && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: accent,
            marginBottom: 14,
          }}
        >
          Committed{athlete.committedSchool ? ` — ${athlete.committedSchool}` : ""}
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, color: "#475569" }}>Built with Statline</span>
        <span style={{ fontSize: 11, color: "#475569" }}>statline.app</span>
      </div>
    </div>
  );
});
