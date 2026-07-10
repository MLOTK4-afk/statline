import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { generateScoutingReport } from "@/lib/anthropic";

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
    const report = await generateScoutingReport(athlete);
    const updated = await store.updateAthlete(athleteId, {
      scoutingReport: report,
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json(
      { error: `Failed to generate scouting report: ${message}` },
      { status: 502 }
    );
  }
}
