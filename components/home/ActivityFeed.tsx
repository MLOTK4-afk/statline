import { EmptyState } from "@/components/ui/EmptyState";

export interface ActivityItem {
  id: string;
  text: string;
  ts: string;
}

function timeAgo(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="border-t border-white/10 bg-navy-950/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl text-white">Live Activity</h2>
        <p className="mt-1 text-slate-400">
          What&apos;s happening on Statline right now.
        </p>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No activity yet"
              description="Once athletes and coaches start using Statline, their activity will show up here."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-sm text-slate-200">{item.text}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {timeAgo(item.ts)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
