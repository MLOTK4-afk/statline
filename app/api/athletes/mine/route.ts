import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function GET() {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) return NextResponse.json(null);

  const athletes = await store.listAthletes();
  const mine = athletes.find((a) => a.ownerToken === ownerToken) ?? null;
  return NextResponse.json(mine);
}
