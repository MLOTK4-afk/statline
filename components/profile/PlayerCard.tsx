import { forwardRef } from "react";
import qrcode from "qrcode-generator";
import type { AthleteProfile } from "@/lib/types";
import type { FitScoreResult } from "@/lib/fitScore";
import { getAthleteTier } from "@/lib/tier";
import { TIER_LABEL } from "@/lib/tier";
import { getSportAccent } from "@/lib/sportTheme";

const CARD_SHARE_ORIGIN = "https://statlinesports.net";

/** Cuts long quotes down to a card-friendly length at a word boundary. */
function truncateQuote(text: string, max = 100): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/**
 * Scalloped seal (24-point badge outline, like an official certificate
 * stamp) with a checkmark, in the primary brand blue -- pairs with the
 * shield monogram to bookend the "new athlete" line.
 */
function ScallopedSealBadge({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="seal-badge-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <polygon
        points="12.00,1.00 14.28,3.50 17.50,2.47 18.22,5.78 21.53,6.50 20.50,9.72 23.00,12.00 20.50,14.28 21.53,17.50 18.22,18.22 17.50,21.53 14.28,20.50 12.00,23.00 9.72,20.50 6.50,21.53 5.78,18.22 2.47,17.50 3.50,14.28 1.00,12.00 3.50,9.72 2.47,6.50 5.78,5.78 6.50,2.47 9.72,3.50"
        fill="url(#seal-badge-gradient)"
      />
      <path
        d="M8 12.4l2.6 2.6 5.2-6"
        stroke="#fff"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  // Prefer a real coach endorsement over the AI-generated tagline -- both
  // are genuine per-athlete content, so either fills the card's empty
  // middle space with something that actually differentiates it.
  const rawQuote = athlete.endorsement?.quote || athlete.scoutingReport?.tagline;
  const quoteText = rawQuote ? truncateQuote(rawQuote) : undefined;
  const quoteAttribution = athlete.endorsement?.quote
    ? [athlete.endorsement.name, athlete.endorsement.title].filter(Boolean).join(", ")
    : undefined;

  // Synchronous, no network/CORS concerns -- generated straight to a data
  // URI so it exports via html-to-image exactly like the rest of the card.
  const qr = qrcode(0, "M");
  qr.addData(`${CARD_SHARE_ORIGIN}/athletes/${athlete.id}`);
  qr.make();
  const qrDataUrl = qr.createDataURL(6, 2);

  return (
    <div
      ref={ref}
      style={{
        width: 400,
        height: 500,
        position: "relative",
        // Gives this div its own stacking context so the watermark's
        // negative z-index below is contained here -- without an explicit
        // z-index, `position: relative` alone doesn't create one, and the
        // watermark escapes to the page root and renders behind everything,
        // including this card's own background (invisible).
        zIndex: 0,
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/logo-no-tagline.png"
        alt=""
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          objectFit: "contain",
          opacity: 0.05,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

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
        <ScallopedSealBadge size={22} />
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
        <VerificationBadge size={22} />
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

      {quoteText && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderLeft: `3px solid ${accent}`,
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: "0 10px 10px 0",
          }}
        >
          <div style={{ fontSize: 13, fontStyle: "italic", color: "#CBD5E1", lineHeight: 1.4 }}>
            &ldquo;{quoteText}&rdquo;
          </div>
          {quoteAttribution && (
            <div style={{ marginTop: 6, fontSize: 10, color: "#64748B" }}>
              — {quoteAttribution}
            </div>
          )}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt=""
            width={32}
            height={32}
            style={{ borderRadius: 4, backgroundColor: "#fff", padding: 2 }}
          />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
            statlinesports.net
          </span>
        </div>
      </div>
    </div>
  );
});
