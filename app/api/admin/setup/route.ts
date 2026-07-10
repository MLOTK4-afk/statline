import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const configuredSecret = process.env.ADMIN_SETUP_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "ADMIN_SETUP_SECRET is not configured on this server." },
      { status: 400 }
    );
  }

  const { secret } = await req.json();
  if (secret !== configuredSecret) {
    return NextResponse.json({ error: "Incorrect secret." }, { status: 403 });
  }

  const updated = await store.updateUser(session.user.id, { role: "admin" });
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
