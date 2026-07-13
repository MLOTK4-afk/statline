import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";
import { StatTile } from "@/components/admin/StatTile";

export const metadata: Metadata = {
  title: "Admin | Statline",
};

export const dynamic = "force-dynamic";

function formatEventType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminPage() {
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

  const [summary, eventStats] = await Promise.all([
    store.getAnalyticsSummary(),
    store.getEventStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Admin Analytics</h1>
          <p className="mt-1 text-slate-400">
            Platform-wide activity across Statline.
          </p>
        </div>
        <Link
          href="/admin/roster"
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:border-white/40"
        >
          Roster Overview →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Total Page Views" value={summary.pageViews} />
        <StatTile label="Profile Views" value={summary.profileViews} />
        <StatTile label="Signups" value={summary.signups} />
        <StatTile label="Profiles Built" value={summary.profilesBuilt} />
        <StatTile label="Domestic Directory Size" value={summary.directorySize} />
        <StatTile
          label="International Directory Size"
          value={summary.internationalDirectorySize}
        />
      </div>

      <h2 className="mt-12 text-2xl text-white">Event Activity</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total Events" value={eventStats.total} />
        <StatTile label="Events (24h)" value={eventStats.last24h} />
        <StatTile label="Events (7d)" value={eventStats.last7d} />
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-sm uppercase tracking-wider text-slate-400">
          Breakdown by Type
        </h3>
        {eventStats.byType.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No events recorded yet.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {eventStats.byType.map((row) => (
              <span
                key={row.type}
                className="rounded-full border border-white/10 bg-navy-900 px-3 py-1 text-xs text-slate-300"
              >
                {formatEventType(row.type)}: {row.count}
              </span>
            ))}
          </div>
        )}
      </div>

      <h2 className="mt-12 text-2xl text-white">Recent Events</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        {eventStats.recent.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No events recorded yet.</p>
        ) : (
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {eventStats.recent.map((event, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 text-slate-200">
                    {formatEventType(event.type)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">
                    {new Date(event.ts).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {event.meta ? JSON.stringify(event.meta) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
