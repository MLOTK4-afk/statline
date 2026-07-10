import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const athlete = await store.getAthlete(params.id);
  if (!athlete) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await store.recordEvent("profile_view", { athleteId: athlete.id });
  return NextResponse.json(athlete);
}

async function canEdit(ownerToken: string | null, athleteOwnerToken: string | null) {
  if (ownerToken && ownerToken === athleteOwnerToken) return true;
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const existing = await store.getAthlete(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ownerToken = await getDeviceToken();
  if (!(await canEdit(ownerToken, existing.ownerToken))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json();
  const updated = await store.updateAthlete(params.id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const existing = await store.getAthlete(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ownerToken = await getDeviceToken();
  if (!(await canEdit(ownerToken, existing.ownerToken))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await store.deleteAthlete(params.id);
  return NextResponse.json({ ok: true });
}
