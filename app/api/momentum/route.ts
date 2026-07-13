import { NextResponse } from "next/server";
import { getOrRefreshMomentum, getViewSparkline } from "@/lib/momentumService";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const athleteId = url.searchParams.get("athleteId");
  const includeSparkline = url.searchParams.get("sparkline") === "true";
  if (!athleteId) {
    return NextResponse.json(
      { error: "athleteId is required." },
      { status: 400 }
    );
  }

  const result = await getOrRefreshMomentum(athleteId);
  if (!result) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!includeSparkline) return NextResponse.json(result);

  const sparkline = await getViewSparkline(athleteId);
  return NextResponse.json({ ...result, sparkline });
}
