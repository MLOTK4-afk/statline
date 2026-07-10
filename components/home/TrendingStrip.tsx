import type { AthleteProfile } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { LinkButton } from "@/components/ui/Button";

export function TrendingStrip({ athletes }: { athletes: AthleteProfile[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl text-white">Trending Athletes</h2>
      <p className="mt-1 text-slate-400">
        The most-viewed profiles on Statline right now.
      </p>

      {athletes.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No trending athletes yet"
            description="As profiles get views from coaches, the most-viewed will show up here. See an example profile to get a sense of what a great one looks like."
            action={
              <LinkButton href="/athletes/example" variant="outline" size="sm">
                See an example profile
              </LinkButton>
            }
          />
        </div>
      ) : (
        <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {athletes.map((athlete) => (
            <div
              key={athlete.id}
              className="w-72 shrink-0 snap-start sm:w-80"
            >
              <ProfileCard athlete={athlete} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
