import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getOwnedBoard } from "@/lib/boardAuth";
import { getDeviceToken } from "@/lib/deviceToken";

export async function POST(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const owned = await getOwnedBoard(ownerToken, params.boardId);
  if (!owned) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const { athleteId, toBoardId } = await req.json();
  if (!athleteId || !toBoardId) {
    return NextResponse.json(
      { error: "athleteId and toBoardId are required." },
      { status: 400 }
    );
  }
  const targetOwned = await getOwnedBoard(ownerToken, toBoardId);
  if (!targetOwned) {
    return NextResponse.json({ error: "Target board not found." }, { status: 404 });
  }
  await store.moveCardToBoard(params.boardId, toBoardId, athleteId);
  const boards = await store.listBoardsByOwnerToken(ownerToken);
  return NextResponse.json(boards);
}
