import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getOwnedBoard } from "@/lib/boardAuth";
import { getDeviceToken } from "@/lib/deviceToken";
import type { BoardColumnKey } from "@/lib/types";

const VALID_COLUMNS: BoardColumnKey[] = [
  "toContact",
  "contacted",
  "replied",
  "offerReceived",
];

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
  const { athleteId, toColumn } = await req.json();
  if (!athleteId || !VALID_COLUMNS.includes(toColumn)) {
    return NextResponse.json(
      { error: "athleteId and a valid toColumn are required." },
      { status: 400 }
    );
  }
  const board = await store.moveBoardCard(params.boardId, athleteId, toColumn);
  return NextResponse.json(board);
}
