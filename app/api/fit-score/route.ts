import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { calculateFitScore } from "@/lib/fitScore";

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

  const benchmarks = await store.getDivisionBenchmarks(athlete.sport);
  const result = calculateFitScore(athlete, benchmarks);
  return NextResponse.json(result);
}
