import { store } from "@/lib/storage";
import type { ScoutingBoard } from "@/lib/types";

/** Returns the board only if it exists and belongs to this user. */
export async function getOwnedBoard(
  userId: string,
  boardId: string
): Promise<ScoutingBoard | null> {
  const board = await store.getBoardById(boardId);
  if (!board || board.userId !== userId) return null;
  return board;
}
