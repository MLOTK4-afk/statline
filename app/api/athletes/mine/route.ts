import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const athletes = await store.listAthletes();
  const mine = athletes.find((a) => a.userId === session.user.id) ?? null;
  return NextResponse.json(mine);
}
