import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";
import { getOwnedBoard } from "@/lib/boardAuth";
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const owned = await getOwnedBoard(session.user.id, params.boardId);
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
