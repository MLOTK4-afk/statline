import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function DELETE(
  _req: Request,
  { params }: { params: { searchId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const user = await store.getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const savedSearches = user.savedSearches.filter(
    (s) => s.id !== params.searchId
  );
  const updated = await store.updateUser(session.user.id, { savedSearches });
  const { passwordHash: _passwordHash, ...safeUser } = updated!;
  return NextResponse.json(safeUser);
}
