import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { computeAthleteMomentum } from "@/lib/momentumService";

/**
 * Meant to be hit once a day by an external scheduler -- e.g. a Hostinger
 * hPanel cron job running `curl -H "Authorization: Bearer $CRON_SECRET"
 * https://yourdomain/api/cron/momentum` -- to refresh every athlete's
 * momentum_cache row, so /api/momentum almost always serves a cached value
 * instead of recomputing on page load. Nothing calls this on its own; if no
 * scheduler is wired up, /api/momentum's lazy 24h-staleness refresh (see
 * getOrRefreshMomentum) is what actually keeps the cache from going stale
 * forever.
 */
export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const athletes = await store.listAthletes();
  let refreshed = 0;
  for (const athlete of athletes) {
    const result = await computeAthleteMomentum(athlete.id);
    if (result) {
      await store.setCachedMomentum(athlete.id, result);
      refreshed++;
    }
  }

  return NextResponse.json({ refreshed, total: athletes.length });
}
