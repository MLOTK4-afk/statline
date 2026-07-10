import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function DELETE(
  _req: Request,
  { params }: { params: { searchId: string } }
) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const savedSearches = await store.removeSavedSearch(ownerToken, params.searchId);
  return NextResponse.json({ savedSearches });
}
