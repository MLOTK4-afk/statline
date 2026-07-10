import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";
import { getOwnedBoard } from "@/lib/boardAuth";

export async function DELETE(
  _req: Request,
  { params }: { params: { boardId: string; athleteId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const owned = await getOwnedBoard(session.user.id, params.boardId);
  if (!owned) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const board = await store.removeAthleteFromBoard(
    params.boardId,
    params.athleteId
  );
  return NextResponse.json(board);
}
