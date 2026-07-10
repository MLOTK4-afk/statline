import { store } from "@/lib/storage";
import type { AthleteProfile } from "@/lib/types";
import { ProfileCard } from "@/components/profile/ProfileCard";

export async function SimilarAthletes({ athlete }: { athlete: AthleteProfile }) {
  const all = await store.listAthletes();
  const similar = all
    .filter(
      (a) =>
        a.id !== athlete.id &&
        !a.isExample &&
        a.published &&
        a.sport === athlete.sport &&
        a.level === athlete.level
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  if (similar.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl text-white">You might also want to scout...</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {similar.map((a) => (
          <ProfileCard key={a.id} athlete={a} />
        ))}
      </div>
    </div>
  );
}
