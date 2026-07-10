import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function POST(req: Request) {
  let body: { type?: unknown; meta?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { type, meta } = body;
  if (typeof type !== "string" || !type) {
    return NextResponse.json({ error: "type is required." }, { status: 400 });
  }
  await store.recordEvent(type, meta);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const summary = await store.getAnalyticsSummary();
  return NextResponse.json(summary);
}
