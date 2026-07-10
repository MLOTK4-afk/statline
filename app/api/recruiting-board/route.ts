import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const board = await store.getRecruitingBoard(session.user.id);
  return NextResponse.json(board);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = await req.json();
  if (!body.schoolName || !body.division) {
    return NextResponse.json(
      { error: "schoolName and division are required." },
      { status: 400 }
    );
  }
  const board = await store.addRecruitingProgram(session.user.id, {
    schoolName: body.schoolName,
    division: body.division,
    coachName: body.coachName,
    coachEmail: body.coachEmail,
    notes: body.notes,
    stage: body.stage ?? "toContact",
  });
  return NextResponse.json(board);
}
