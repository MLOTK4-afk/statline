import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

/**
 * Anonymous per-visitor state (starred athletes, followed athletes, saved
 * searches) keyed by the device-token cookie — there's no signed-in account
 * involved, since the app allows fully anonymous form submission.
 */
export async function GET() {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({
      starredAthletes: [],
      following: [],
      savedSearches: [],
    });
  }

  const [starredAthletes, following, savedSearches] = await Promise.all([
    store.getStarredAthleteIds(ownerToken),
    store.getFollowingIds(ownerToken),
    store.listSavedSearches(ownerToken),
  ]);

  return NextResponse.json({ starredAthletes, following, savedSearches });
}
