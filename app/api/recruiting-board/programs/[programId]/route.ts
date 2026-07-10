import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/storage";

export async function PATCH(
  req: Request,
  { params }: { params: { programId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = await req.json();
  const board = await store.updateRecruitingProgram(
    session.user.id,
    params.programId,
    body
  );
  return NextResponse.json(board);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { programId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const board = await store.removeRecruitingProgram(
    session.user.id,
    params.programId
  );
  return NextResponse.json(board);
}
