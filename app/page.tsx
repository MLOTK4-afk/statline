import { Suspense } from "react";
import { store } from "@/lib/storage";
import { Hero } from "@/components/home/Hero";
import { StatCallout } from "@/components/home/StatCallout";
import { TrendingStrip } from "@/components/home/TrendingStrip";
import { ActivityFeed, type ActivityItem } from "@/components/home/ActivityFeed";
import { Spotlight } from "@/components/home/Spotlight";
import { CoachHomeRedirect } from "@/components/home/CoachHomeRedirect";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allAthletes = await store.listAthletes();
  const published = allAthletes.filter((a) => a.published && !a.isInternational);

  const trending = [...published]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 8);

  const spotlight = published
    .filter((a) => a.scoutingReport)
    .sort(
      (a, b) =>
        new Date(b.scoutingReport!.generatedAt).getTime() -
        new Date(a.scoutingReport!.generatedAt).getTime()
    )
    .slice(0, 3);

  const events = await store.getRecentEvents(["profile_built", "signup"], 8);
  const athleteById = new Map(allAthletes.map((a) => [a.id, a]));

  const activityItems: ActivityItem[] = events.map((event, idx) => {
    if (event.type === "profile_built") {
      const athlete = event.meta?.athleteId
        ? athleteById.get(event.meta.athleteId)
        : undefined;
      return {
        id: `${event.type}-${idx}-${event.ts}`,
        text: athlete
          ? `New ${athlete.sport} profile added in ${athlete.region}`
          : "New athlete profile added",
        ts: event.ts,
      };
    }
    return {
      id: `${event.type}-${idx}-${event.ts}`,
      text: "A new user joined Statline",
      ts: event.ts,
    };
  });

  return (
    <>
      <Suspense fallback={null}>
        <CoachHomeRedirect />
      </Suspense>
      <Hero />
      <Reveal>
        <StatCallout count={published.length} />
      </Reveal>
      <Reveal>
        <TrendingStrip athletes={trending} />
      </Reveal>
      <Reveal>
        <ActivityFeed items={activityItems} />
      </Reveal>
      <Reveal>
        <Spotlight athletes={spotlight} />
      </Reveal>
    </>
  );
}
