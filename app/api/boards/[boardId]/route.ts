import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getOwnedBoard } from "@/lib/boardAuth";
import { getDeviceToken } from "@/lib/deviceToken";

export async function PATCH(
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
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }
  const board = await store.renameBoard(params.boardId, name);
  return NextResponse.json(board);
}

export async function DELETE(
  _req: Request,
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
  await store.deleteBoard(params.boardId);
  return NextResponse.json({ ok: true });
}
