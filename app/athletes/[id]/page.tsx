import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";
import { calculateFitScore } from "@/lib/fitScore";
import { getOrRefreshMomentum, getViewSparkline } from "@/lib/momentumService";
import { ProfileFull } from "@/components/profile/ProfileFull";
import { StarButton } from "@/components/profile/StarButton";
import { FollowButton } from "@/components/profile/FollowButton";
import { ShareLinkButton } from "@/components/profile/ShareLinkButton";
import { TargetSchoolsEditor } from "@/components/profile/TargetSchoolsEditor";
import { SimilarAthletes } from "@/components/profile/SimilarAthletes";
import { MomentumBadge } from "@/components/profile/MomentumBadge";
import { MomentumSparkline } from "@/components/profile/MomentumSparkline";
import { ActivityTimeline } from "@/components/profile/ActivityTimeline";
import { DownloadCardButton } from "@/components/profile/DownloadCardButton";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const athlete = await store.getAthlete(params.id);
  return { title: athlete ? `${athlete.name} | Statline` : "Statline" };
}

export default async function AthletePage({
  params,
}: {
  params: { id: string };
}) {
  const athlete = await store.getAthlete(params.id);
  if (!athlete || !athlete.published) notFound();

  await store.recordEvent("profile_view", { athleteId: athlete.id });
  const updated = await store.updateAthlete(params.id, {
    viewCount: (athlete.viewCount ?? 0) + 1,
  });
  const finalAthlete = updated ?? athlete;

  const [ownerToken, followerCount] = await Promise.all([
    getDeviceToken(),
    store.getFollowerCount(athlete.id),
  ]);
  const isOwner = !!ownerToken && ownerToken === athlete.ownerToken;

  // Fit Score, Momentum, and the Activity Log are all additive -- if their
  // tables aren't migrated yet (or Postgres hiccups), the profile page
  // itself must still render. Each one fails independently and silently
  // rather than taking down the whole page.
  const fitScore = await store
    .getDivisionBenchmarks(athlete.sport)
    .then((benchmarks) => calculateFitScore(finalAthlete, benchmarks))
    .catch(() => undefined);

  const [momentum, sparkline, activity] = isOwner
    ? await Promise.all([
        getOrRefreshMomentum(athlete.id).catch(() => null),
        getViewSparkline(athlete.id).catch(() => null),
        store.getActivityTimeline(athlete.id, 100).catch(() => null),
      ])
    : [null, null, null];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        {isOwner && (
          <DownloadCardButton
            athlete={finalAthlete}
            fitScore={fitScore}
            label="Player Card"
          />
        )}
        <ShareLinkButton athleteId={athlete.id} />
        <FollowButton athleteId={athlete.id} isOwner={isOwner} />
        <StarButton athleteId={athlete.id} />
      </div>

      <p className="mb-2 text-right text-xs text-slate-500">
        {followerCount} {followerCount === 1 ? "follower" : "followers"}
      </p>

      <ProfileFull athlete={finalAthlete} fitScore={fitScore} />

      {isOwner && (
        <TargetSchoolsEditor
          athleteId={athlete.id}
          initialSchools={athlete.targetSchools ?? []}
        />
      )}

      {isOwner && momentum && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg text-white">
              Recruiting Momentum
            </h2>
            <MomentumBadge
              label={momentum.label}
              trendPercent={momentum.trendPercent}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Only visible to you — based on views and coach interest over the
            last 14 days vs. the 14 days before that.
          </p>
          {sparkline && (
            <MomentumSparkline counts={sparkline} className="mt-4 h-12 w-full" />
          )}
        </Card>
      )}

      {isOwner && activity && (
        <Card className="mt-6 p-6">
          <h2 className="font-heading text-lg text-white">Activity Log</h2>
          <p className="mt-1 text-xs text-slate-500">
            Only visible to you and Statline admins.
          </p>
          <div className="mt-4">
            <ActivityTimeline events={activity} />
          </div>
        </Card>
      )}

      <SimilarAthletes athlete={finalAthlete} />
    </div>
  );
}
