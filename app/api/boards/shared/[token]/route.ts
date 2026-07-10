import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import type { BoardColumnKey } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const board = await store.getBoardByShareToken(params.token);
  if (!board) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const athleteIds = new Set<string>();
  (Object.keys(board.columns) as BoardColumnKey[]).forEach((col) => {
    board.columns[col].forEach((card) => athleteIds.add(card.athleteId));
  });

  const allAthletes = await store.listAthletes();
  const athletes = allAthletes.filter((a) => athleteIds.has(a.id));

  return NextResponse.json({ board, athletes });
}
