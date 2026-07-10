import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";
import { getOwnedBoard } from "@/lib/boardAuth";

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
  const { athleteId, toBoardId } = await req.json();
  if (!athleteId || !toBoardId) {
    return NextResponse.json(
      { error: "athleteId and toBoardId are required." },
      { status: 400 }
    );
  }
  const targetOwned = await getOwnedBoard(session.user.id, toBoardId);
  if (!targetOwned) {
    return NextResponse.json({ error: "Target board not found." }, { status: 404 });
  }
  await store.moveCardToBoard(params.boardId, toBoardId, athleteId);
  const boards = await store.listBoardsByUserId(session.user.id);
  return NextResponse.json(boards);
}
