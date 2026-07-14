import type { AthleteProfile } from "@/lib/types";
import type { FitScoreResult } from "@/lib/fitScore";
import { Card } from "@/components/ui/Card";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { StatCardGrid } from "@/components/profile/StatCardGrid";
import { FitScoreCard } from "@/components/profile/FitScoreCard";
import { getAthleteTier } from "@/lib/tier";
import { getSportAccent } from "@/lib/sportTheme";

export function ProfileFull({
  athlete,
  fitScore,
}: {
  athlete: AthleteProfile;
  fitScore?: FitScoreResult;
}) {
  const accent = getSportAccent(athlete.sport);

  return (
    <Card
      className="angular-bg overflow-hidden p-8"
      style={{ borderTopColor: accent, borderTopWidth: 3 }}
    >
      {athlete.bannerUrl && (
        <div
          className="-mx-8 -mt-8 mb-8 h-48 bg-cover bg-center sm:h-64"
          style={{
            backgroundImage: `linear-gradient(180deg, ${accent}33 0%, rgba(15,23,42,0.92) 100%), url(${athlete.bannerUrl})`,
          }}
        />
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="pill-glow-flare inline-flex items-center px-5 py-1.5 text-4xl sm:text-5xl">
              <span className="text-gradient-flare">{athlete.name}</span>
            </h1>
            <TierBadge tier={getAthleteTier(athlete)} />
          </div>
          <p className="mt-2 text-lg text-slate-400">
            {athlete.sport} &middot; {athlete.region}
            {athlete.gradYear ? ` · Class of ${athlete.gradYear}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{athlete.level.replace("-", " ")}</Badge>
            {athlete.team && <Badge>{athlete.team}</Badge>}
            {athlete.positions && <Badge>{athlete.positions}</Badge>}
            {athlete.heightWeight && <Badge>{athlete.heightWeight}</Badge>}
            {athlete.gpa && <Badge>GPA {athlete.gpa}</Badge>}
            {athlete.committed ? (
              <Badge className="border-electric-500/40 text-electric-500">
                Committed{athlete.committedSchool ? ` — ${athlete.committedSchool}` : ""}
              </Badge>
            ) : (
              <Badge>Uncommitted</Badge>
            )}
            {athlete.isInternational && <Badge>International</Badge>}
            {!athlete.isExample && (
              <Badge>{athlete.viewCount ?? 0} views</Badge>
            )}
          </div>
        </div>

        {athlete.highlightUrl && (
          <a
            href={athlete.highlightUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            Watch Highlight Film
          </a>
        )}
      </div>

      {athlete.scoutingReport && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="font-heading text-xl italic text-skyline-300">
            &ldquo;{athlete.scoutingReport.tagline}&rdquo;
          </p>
          <p className="mt-3 text-slate-300">{athlete.scoutingReport.summary}</p>

          {athlete.scoutingReport.strengths.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">
                Strengths
              </h3>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {athlete.scoutingReport.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {athlete.scoutingReport?.statCards && athlete.scoutingReport.statCards.length > 0 && (
        <div className="mt-6">
          <StatCardGrid cards={athlete.scoutingReport.statCards} />
        </div>
      )}

      {Object.keys(athlete.stats).length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Reported Stats
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(athlete.stats).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/5 px-3 py-2">
                <div className="text-lg text-white">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {athlete.previousSeasonStats && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Season History
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-electric-500/30 bg-electric-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-electric-500">
                Current Season
              </div>
              <div className="mt-2 space-y-1 text-sm text-slate-300">
                {Object.entries(athlete.stats).length > 0 ? (
                  Object.entries(athlete.stats).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-slate-500">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">No current stats reported.</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-slate-400">
                Previous Season
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-300">
                {athlete.previousSeasonStats}
              </p>
            </div>
          </div>
        </div>
      )}

      {athlete.combine && athlete.combine.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm uppercase tracking-wider text-slate-400">
              Combine Numbers
            </h3>
            <Badge>
              {athlete.combineVerified ? "Verified" : "Self-reported"}
            </Badge>
          </div>
          <div className="mt-3">
            <StatCardGrid cards={athlete.combine} />
          </div>
        </div>
      )}

      {athlete.achievements.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Achievements
          </h3>
          <ul className="mt-3 space-y-1.5">
            {athlete.achievements.map((a) => (
              <li key={a} className="text-sm text-slate-300">
                &bull; {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {athlete.targetSchools && athlete.targetSchools.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Target Schools
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {athlete.targetSchools.map((school) => (
              <Badge key={school}>{school}</Badge>
            ))}
          </div>
        </div>
      )}

      {athlete.endorsement && (
        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Coach Endorsement
          </h3>
          <p className="mt-3 italic text-slate-300">
            &ldquo;{athlete.endorsement.quote}&rdquo;
          </p>
          <p className="mt-3 text-sm text-slate-500">
            — {athlete.endorsement.name}, {athlete.endorsement.title}
          </p>
        </div>
      )}

      {athlete.divisionMatch && (
        <div className="mt-6 rounded-lg border border-skyline-300/30 bg-skyline-300/5 p-5">
          <h3 className="font-heading text-lg text-skyline-300">
            AI Division Match: {athlete.divisionMatch.division}{" "}
            <span className="text-sm font-normal text-slate-400">
              ({athlete.divisionMatch.confidence} confidence)
            </span>
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {athlete.divisionMatch.reasoning}
          </p>
        </div>
      )}

      {fitScore && <FitScoreCard result={fitScore} />}
    </Card>
  );
}
