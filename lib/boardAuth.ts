import { store } from "@/lib/storage";
import type { ScoutingBoard } from "@/lib/types";

/** Returns the board only if it exists and belongs to this device token. */
export async function getOwnedBoard(
  ownerToken: string,
  boardId: string
): Promise<ScoutingBoard | null> {
  const board = await store.getBoardById(boardId);
  if (!board || board.ownerToken !== ownerToken) return null;
  return board;
}
