import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { generateDivisionMatch } from "@/lib/anthropic";

export async function POST(req: Request) {
  const { athleteId } = await req.json();
  if (!athleteId) {
    return NextResponse.json(
      { error: "athleteId is required." },
      { status: 400 }
    );
  }

  const athlete = await store.getAthlete(athleteId);
  if (!athlete) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const match = await generateDivisionMatch(athlete);
    const updated = await store.updateAthlete(athleteId, {
      divisionMatch: match,
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json(
      { error: `Failed to generate division match: ${message}` },
      { status: 502 }
    );
  }
}
