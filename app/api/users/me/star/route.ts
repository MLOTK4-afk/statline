import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { athleteId } = await req.json();
  const user = await store.getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const starred = new Set(user.starredAthletes);
  starred.has(athleteId) ? starred.delete(athleteId) : starred.add(athleteId);

  const updated = await store.updateUser(session.user.id, {
    starredAthletes: Array.from(starred),
  });
  const { passwordHash: _passwordHash, ...safeUser } = updated!;
  return NextResponse.json(safeUser);
}
