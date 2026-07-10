import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const user = await store.getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = await req.json();
  const updated = await store.updateUser(session.user.id, {
    preferences: body.preferences,
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const { passwordHash: _passwordHash, ...safeUser } = updated;
  return NextResponse.json(safeUser);
}
