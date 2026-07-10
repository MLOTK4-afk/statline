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
  const { athleteId, note } = await req.json();
  if (!athleteId) {
    return NextResponse.json(
      { error: "athleteId is required." },
      { status: 400 }
    );
  }
  const board = await store.updateBoardCardNote(
    params.boardId,
    athleteId,
    note ?? ""
  );
  return NextResponse.json(board);
}
