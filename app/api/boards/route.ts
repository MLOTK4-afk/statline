import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function GET() {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) return NextResponse.json([]);
  const boards = await store.listBoardsByOwnerToken(ownerToken);
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }
  const board = await store.createBoard(ownerToken, name);
  return NextResponse.json(board, { status: 201 });
}
