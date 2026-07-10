import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function POST(req: Request) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const { name, filters } = await req.json();
  if (!name || !filters) {
    return NextResponse.json(
      { error: "name and filters are required." },
      { status: 400 }
    );
  }
  const savedSearches = await store.addSavedSearch(ownerToken, name, filters);
  return NextResponse.json({ savedSearches });
}
