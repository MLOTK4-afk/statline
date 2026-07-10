import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getOwnedBoard } from "@/lib/boardAuth";
import { getDeviceToken } from "@/lib/deviceToken";

export async function DELETE(
  _req: Request,
  { params }: { params: { boardId: string; athleteId: string } }
) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const owned = await getOwnedBoard(ownerToken, params.boardId);
  if (!owned) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const board = await store.removeAthleteFromBoard(
    params.boardId,
    params.athleteId
  );
  return NextResponse.json(board);
}
