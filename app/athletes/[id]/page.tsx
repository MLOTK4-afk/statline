import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";
import { ProfileFull } from "@/components/profile/ProfileFull";
import { StarButton } from "@/components/profile/StarButton";
import { FollowButton } from "@/components/profile/FollowButton";
import { ShareLinkButton } from "@/components/profile/ShareLinkButton";
import { TargetSchoolsEditor } from "@/components/profile/TargetSchoolsEditor";
import { SimilarAthletes } from "@/components/profile/SimilarAthletes";

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

  const [session, followerCount] = await Promise.all([
    getServerSession(authOptions),
    store.getFollowerCount(athlete.id),
  ]);
  const isOwner = session?.user?.id === athlete.userId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-4 flex justify-end gap-2">
        <ShareLinkButton athleteId={athlete.id} />
        <FollowButton athleteId={athlete.id} ownerUserId={athlete.userId} />
        <StarButton athleteId={athlete.id} />
      </div>

      <p className="mb-2 text-right text-xs text-slate-500">
        {followerCount} {followerCount === 1 ? "follower" : "followers"}
      </p>

      <ProfileFull athlete={finalAthlete} />

      {isOwner && (
        <TargetSchoolsEditor
          athleteId={athlete.id}
          initialSchools={athlete.targetSchools ?? []}
        />
      )}

      <SimilarAthletes athlete={finalAthlete} />
    </div>
  );
}
