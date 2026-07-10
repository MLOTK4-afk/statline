import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function POST(req: Request) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const { athleteId } = await req.json();
  if (!athleteId) {
    return NextResponse.json({ error: "athleteId is required." }, { status: 400 });
  }
  const starredAthletes = await store.toggleStar(ownerToken, athleteId);
  return NextResponse.json({ starredAthletes });
}
