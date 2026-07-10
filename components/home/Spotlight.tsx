import type { AthleteProfile } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/Badge";
import { getAthleteTier } from "@/lib/tier";

export function Spotlight({ athletes }: { athletes: AthleteProfile[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl text-white">Spotlight Profiles</h2>
      <p className="mt-1 text-slate-400">
        Featured athletes with AI-powered scouting reports.
      </p>

      {athletes.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No spotlight profiles yet"
            description="Profiles with a generated scouting report will be featured here."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <LinkButton href="/build-profile" size="sm">
                  Build the first profile
                </LinkButton>
                <LinkButton href="/athletes/example" variant="outline" size="sm">
                  See an example profile
                </LinkButton>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {athletes.map((athlete) => (
            <Card key={athlete.id} className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xl text-white">
                  {athlete.name}
                </h3>
                <TierBadge tier={getAthleteTier(athlete)} />
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {athlete.sport} &middot; {athlete.region}
              </p>
              {athlete.scoutingReport && (
                <p className="mt-3 line-clamp-3 text-sm text-slate-300">
                  {athlete.scoutingReport.summary}
                </p>
              )}
              <LinkButton
                href={`/athletes/${athlete.id}`}
                variant="ghost"
                size="sm"
                className="mt-4 px-0"
              >
                View Full Profile &rarr;
              </LinkButton>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
