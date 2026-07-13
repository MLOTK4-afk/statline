"use client";

import { useState } from "react";
import type { ActivityEvent } from "@/lib/types";

const ICONS: Record<ActivityEvent["type"], string> = {
  profile_viewed: "👁",
  profile_built: "✦",
  profile_updated: "✎",
  starred: "★",
  added_to_board: "📋",
};

const LABELS: Record<ActivityEvent["type"], string> = {
  profile_viewed: "Your profile was viewed",
  profile_built: "Profile created",
  profile_updated: "You updated your profile",
  starred: "A coach starred your profile",
  added_to_board: "Added to a coach's scouting board",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

const PAGE_SIZE = 20;

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No activity yet — this fills in as coaches view and engage with your
        profile.
      </p>
    );
  }

  const shown = events.slice(0, visible);

  return (
    <div>
      <ul className="space-y-4">
        {shown.map((event, i) => (
          <li key={`${event.type}-${event.ts}-${i}`} className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm">
              {ICONS[event.type]}
            </span>
            <div>
              <p className="text-sm text-slate-200">
                {event.detail ?? LABELS[event.type]}
              </p>
              <p className="text-xs text-slate-500">{relativeTime(event.ts)}</p>
            </div>
          </li>
        ))}
      </ul>
      {visible < events.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-4 text-sm font-semibold text-electric-500 hover:text-electric-600"
        >
          Show more
        </button>
      )}
    </div>
  );
}
