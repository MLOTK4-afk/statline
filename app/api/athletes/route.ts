import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";
import { validateAdditionalSports } from "@/lib/validateAdditionalSports";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const international = searchParams.get("international");

  let athletes = await store.listAthletes();
  athletes = athletes.filter((a) => a.published);

  if (international === "true") {
    athletes = athletes.filter((a) => a.isInternational);
  } else if (international === "false") {
    athletes = athletes.filter((a) => !a.isInternational);
  }

  const sport = searchParams.get("sport");
  if (sport) athletes = athletes.filter((a) => a.sport === sport);

  const level = searchParams.get("level");
  if (level) athletes = athletes.filter((a) => a.level === level);

  const region = searchParams.get("region");
  if (region) athletes = athletes.filter((a) => a.region === region);

  const committed = searchParams.get("committed");
  if (committed === "true") athletes = athletes.filter((a) => a.committed);
  if (committed === "false") athletes = athletes.filter((a) => !a.committed);

  const q = searchParams.get("q");
  if (q) {
    const needle = q.toLowerCase();
    athletes = athletes.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) ||
        a.sport.toLowerCase().includes(needle) ||
        a.region.toLowerCase().includes(needle)
    );
  }

  athletes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(athletes);
}

export async function POST(req: Request) {
  const ownerToken = await getDeviceToken();

  const body = await req.json();

  const required = ["level", "sport", "name", "region", "contactEmail"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const additionalSportsError = validateAdditionalSports(body.additionalSports);
  if (additionalSportsError) {
    return NextResponse.json({ error: additionalSportsError }, { status: 400 });
  }

  const athlete = await store.createAthlete({
    ownerToken,
    level: body.level,
    sport: body.sport,
    additionalSports: body.additionalSports,
    name: body.name,
    jerseyNumber: body.jerseyNumber,
    region: body.region,
    gradYear: body.gradYear,
    heightWeight: body.heightWeight,
    positions: body.positions,
    gpa: body.gpa,
    stats: body.stats ?? {},
    highlightUrl: body.highlightUrl,
    achievements: body.achievements ?? [],
    previousSeasonStats: body.previousSeasonStats,
    combine: body.combine,
    endorsement: body.endorsement,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    committed: Boolean(body.committed),
    committedSchool: body.committedSchool,
    published: body.published !== undefined ? Boolean(body.published) : true,
    isInternational: Boolean(body.isInternational),
    international: body.international,
    targetSchools: body.targetSchools,
    viewCount: 0,
  });

  await store.recordEvent("profile_built", { athleteId: athlete.id });

  return NextResponse.json(athlete, { status: 201 });
}
