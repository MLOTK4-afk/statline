import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuid } from "uuid";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { name, filters } = await req.json();
  if (!name || !filters) {
    return NextResponse.json(
      { error: "name and filters are required." },
      { status: 400 }
    );
  }
  const user = await store.getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const savedSearches = [
    ...user.savedSearches,
    { id: uuid(), name, filters, createdAt: new Date().toISOString() },
  ];
  const updated = await store.updateUser(session.user.id, { savedSearches });
  const { passwordHash: _passwordHash, ...safeUser } = updated!;
  return NextResponse.json(safeUser);
}
