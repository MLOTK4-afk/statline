import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";
import { canEditAthlete } from "@/lib/canEditAthlete";

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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const existing = await store.getAthlete(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ownerToken = await getDeviceToken();
  if (!(await canEditAthlete(ownerToken, existing.ownerToken))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json();
  const updated = await store.updateAthlete(params.id, body);
  await store.recordEvent("profile_updated", { athleteId: params.id });
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
  if (!(await canEditAthlete(ownerToken, existing.ownerToken))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await store.deleteAthlete(params.id);
  return NextResponse.json({ ok: true });
}
