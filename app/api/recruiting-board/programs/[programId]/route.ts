import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function PATCH(
  req: Request,
  { params }: { params: { programId: string } }
) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const body = await req.json();
  const board = await store.updateRecruitingProgram(
    ownerToken,
    params.programId,
    body
  );
  return NextResponse.json(board);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { programId: string } }
) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const board = await store.removeRecruitingProgram(
    ownerToken,
    params.programId
  );
  return NextResponse.json(board);
}
