import { NextResponse } from "next/server";
import { store } from "@/lib/storage";

/** Powers Browse's client-side "minimum fit score" filter, which needs every benchmark row up front rather than one POST per athlete card. */
export async function GET(req: Request) {
  const sport = new URL(req.url).searchParams.get("sport") ?? undefined;
  const benchmarks = await store.getDivisionBenchmarks(sport);
  return NextResponse.json(benchmarks);
}
