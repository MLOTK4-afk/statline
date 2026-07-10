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
  const { enabled } = await req.json();
  const board = await store.setBoardShareEnabled(
    params.boardId,
    Boolean(enabled)
  );
  return NextResponse.json(board);
}
