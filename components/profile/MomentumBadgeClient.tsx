"use client";

import { useEffect, useState } from "react";
import { MomentumBadge } from "@/components/profile/MomentumBadge";
import type { MomentumLabel } from "@/lib/momentum";

/**
 * Self-fetching, badge-only version for compact contexts like Browse
 * directory cards -- renders nothing while loading or on error, so a slow
 * or failed momentum fetch never blocks or disrupts the card grid.
 *
 * At directory scale this becomes one fetch per visible card; fine for
 * where this app is today, but worth batching into the athletes list
 * response if the directory grows large.
 */
export function MomentumBadgeClient({ athleteId }: { athleteId: string }) {
  const [data, setData] = useState<{
    label: MomentumLabel;
    trendPercent: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/momentum?athleteId=${athleteId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  if (!data) return null;
  return <MomentumBadge label={data.label} trendPercent={data.trendPercent} />;
}
