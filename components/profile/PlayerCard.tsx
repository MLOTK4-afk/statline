import { forwardRef } from "react";
import type { AthleteProfile } from "@/lib/types";
import type { FitScoreResult } from "@/lib/fitScore";
import { getAthleteTier } from "@/lib/tier";
import { TIER_LABEL } from "@/lib/tier";
import { getSportAccent } from "@/lib/sportTheme";

/**
 * Shield-shaped seal (outer ring outline + inner filled shield with an "S"
 * monogram) marking a card as a real, athlete-made Statline player card --
 * distinct from a generic checkmark so it doesn't read as "verified" in the
 * blue-checkmark-on-social-media sense.
 */
function VerificationBadge({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-2 -2 28 28">
      <defs>
        <linearGradient id="verification-badge-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <g transform="translate(12,12) scale(1.22) translate(-12,-12)">
        <path
          d="M12 1.5l8 3v6c0 6-3.4 9.6-8 11-4.6-1.4-8-5-8-11v-6z"
          fill="none"
          stroke="url(#verification-badge-gradient)"
          strokeWidth={1.1}
        />
      </g>
      <path
        d="M12 1.5l8 3v6c0 6-3.4 9.6-8 11-4.6-1.4-8-5-8-11v-6z"
        fill="url(#verification-badge-gradient)"
      />
      <text
        x="12"
        y="15.3"
        textAnchor="middle"
        fontFamily="var(--font-big-shoulders), sans-serif"
        fontWeight={700}
        fontSize={9.5}
        fill="#fff"
      >
        S
      </text>
    </svg>
  );
}

/**
 * The exportable "flex card" -- rendered at a fixed 400x500 (4:5, Instagram's
 * ideal feed-portrait ratio) and exported via html-to-image at a high
 * pixelRatio so the PNG comes out ~1080x1350. The banner photo is a real
 * <img> with crossOrigin set so html-to-image can inline it from Supabase
 * Storage's public (CORS-enabled) URL; if there's no banner, a placeholder
 * fills the same space instead of leaving a gap.
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
        padding: "24px 24px 20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo-no-tagline.png"
            alt=""
            width={26}
            height={26}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "var(--font-big-shoulders), sans-serif",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#fff",
            }}
          >
            Statline
          </span>
        </div>
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

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 7 }}>
        <VerificationBadge size={22} />
        <span
          style={{
            fontFamily: "var(--font-big-shoulders), sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            backgroundImage: "linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          New Statline athlete
        </span>
      </div>

      <div
        style={{
          marginTop: 12,
          width: "100%",
          height: 148,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: "#1B2542",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {athlete.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={athlete.bannerUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="8.5" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M21 15.5 15.5 11 6 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-big-shoulders), sans-serif",
            fontWeight: 800,
            fontSize: 20,
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}
        >
          {athlete.name}
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#94A3B8" }}>
          {athlete.sport}
          {athlete.positions ? ` · ${athlete.positions}` : ""}
        </div>
        <div style={{ marginTop: 2, fontSize: 12, color: "#64748B" }}>
          {athlete.team || athlete.region}
          {athlete.gradYear ? ` · Class of ${athlete.gradYear}` : ""}
        </div>
      </div>

      {tiles.length > 0 && (
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(tiles.length, 3)}, 1fr)`,
            gap: 8,
          }}
        >
          {tiles.slice(0, 3).map((t) => (
            <div
              key={t.label}
              style={{
                borderRadius: 11,
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: "9px 6px",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-big-shoulders), sans-serif", fontWeight: 800, fontSize: 17 }}>
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
            marginBottom: 10,
          }}
        >
          Committed{athlete.committedSchool ? ` — ${athlete.committedSchool}` : ""}
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 10, color: "#475569" }}>Built with Statline</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
          statlinesports.net
        </span>
      </div>
    </div>
  );
});
