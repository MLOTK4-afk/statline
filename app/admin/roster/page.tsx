import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";
import { computeAthleteCompleteness } from "@/lib/completeness";
import { RosterTable, type RosterRow } from "@/components/admin/RosterTable";

export const metadata: Metadata = {
  title: "Roster Overview | Statline Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminRosterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-3xl text-white">Access Restricted</h1>
        <p className="mt-2 text-slate-400">
          The admin dashboard is only available to administrator accounts.
        </p>
      </div>
    );
  }

  const [athletes, outreachMap] = await Promise.all([
    store.listAthletes(),
    store.getOutreachStatusMap(),
  ]);

  const rows: RosterRow[] = athletes
    .filter((a) => !a.isExample)
    .map((a) => {
      const { percent } = computeAthleteCompleteness(a);
      return {
        id: a.id,
        name: a.name,
        sport: a.sport,
        gradYear: a.gradYear ?? "—",
        completionPercent: percent,
        lastActivity: a.updatedAt,
        outreachStatus: outreachMap[a.id] ?? null,
        committed: a.committed,
        contactEmail: a.contactEmail,
      };
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl text-white">Roster Overview</h1>
      <p className="mt-1 text-slate-400">
        Every athlete profile on Statline, with completion and outreach
        status at a glance.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        &ldquo;Last Activity&rdquo; reflects the profile&apos;s last update
        (including automatic view-count updates), since there&apos;s no
        separate per-coach interaction log to draw from yet.
      </p>

      <div className="mt-8">
        <RosterTable rows={rows} />
      </div>
    </div>
  );
}
