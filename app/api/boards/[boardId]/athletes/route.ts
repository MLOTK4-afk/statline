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
  const { athleteId } = await req.json();
  if (!athleteId) {
    return NextResponse.json(
      { error: "athleteId is required." },
      { status: 400 }
    );
  }
  const board = await store.addAthleteToBoard(params.boardId, athleteId);
  return NextResponse.json(board);
}
