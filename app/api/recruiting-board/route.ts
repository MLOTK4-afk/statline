import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";

export async function GET() {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ ownerToken: null, programs: [], updatedAt: new Date().toISOString() });
  }
  const board = await store.getRecruitingBoard(ownerToken);
  return NextResponse.json(board);
}

export async function POST(req: Request) {
  const ownerToken = await getDeviceToken();
  if (!ownerToken) {
    return NextResponse.json({ error: "No device token." }, { status: 400 });
  }
  const body = await req.json();
  if (!body.schoolName || !body.division) {
    return NextResponse.json(
      { error: "schoolName and division are required." },
      { status: 400 }
    );
  }
  const board = await store.addRecruitingProgram(ownerToken, {
    schoolName: body.schoolName,
    division: body.division,
    coachName: body.coachName,
    coachEmail: body.coachEmail,
    notes: body.notes,
    stage: body.stage ?? "toContact",
  });
  return NextResponse.json(board);
}
