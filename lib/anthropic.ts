import Anthropic from "@anthropic-ai/sdk";
import type { AthleteProfile, DivisionMatch, ScoutingReport } from "@/lib/types";

const MODEL = "claude-sonnet-4-6";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment to enable AI scouting reports."
    );
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.trim());
}

function textFromMessage(message: Anthropic.Message): string {
  const block = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!block) throw new Error("Claude response did not include a text block.");
  return block.text;
}

export async function generateScoutingReport(
  athlete: Pick<
    AthleteProfile,
    | "name"
    | "level"
    | "sport"
    | "region"
    | "gradYear"
    | "heightWeight"
    | "positions"
    | "gpa"
    | "stats"
    | "achievements"
    | "committed"
    | "committedSchool"
  >
): Promise<ScoutingReport> {
  const client = getClient();

  const prompt = `You are a professional athletic scout writing a recruiting profile summary.

Athlete details:
- Name: ${athlete.name}
- Level: ${athlete.level}
- Sport: ${athlete.sport}
- Region: ${athlete.region}
${athlete.gradYear ? `- Graduation year: ${athlete.gradYear}\n` : ""}${
    athlete.heightWeight ? `- Height/Weight: ${athlete.heightWeight}\n` : ""
  }${athlete.positions ? `- Position(s): ${athlete.positions}\n` : ""}${
    athlete.gpa ? `- GPA: ${athlete.gpa}\n` : ""
  }- Stats: ${JSON.stringify(athlete.stats)}
- Achievements: ${athlete.achievements.join("; ") || "None listed"}
- Committed: ${athlete.committed ? `Yes, to ${athlete.committedSchool ?? "an undisclosed program"}` : "No"}

Write a scouting report based ONLY on the information given. Do not invent stats or achievements that were not provided. Respond with ONLY a JSON object (no markdown fences, no commentary) matching exactly this shape:

{
  "tagline": "a punchy 6-10 word tagline capturing their playing identity",
  "summary": "a 3-5 sentence scouting summary written like a professional recruiting analyst",
  "strengths": ["3 to 5 short strength bullet points"],
  "statCards": [{"label": "stat name", "value": "stat value"}]
}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: prompt }],
  });

  const parsed = extractJson(textFromMessage(message)) as Omit<
    ScoutingReport,
    "generatedAt"
  >;

  return { ...parsed, generatedAt: new Date().toISOString() };
}

export async function generateDivisionMatch(
  athlete: Pick<
    AthleteProfile,
    | "name"
    | "sport"
    | "region"
    | "gradYear"
    | "heightWeight"
    | "positions"
    | "gpa"
    | "stats"
    | "achievements"
  > & {
    international?: AthleteProfile["international"];
  }
): Promise<DivisionMatch> {
  const client = getClient();

  const prompt = `You are an NCAA recruiting analyst helping an international student-athlete understand which college division is realistic for them.

Athlete details:
- Name: ${athlete.name}
- Sport: ${athlete.sport}
- Home country / region: ${athlete.region}
${athlete.gradYear ? `- Graduation year: ${athlete.gradYear}\n` : ""}${
    athlete.heightWeight ? `- Height/Weight: ${athlete.heightWeight}\n` : ""
  }${athlete.positions ? `- Position(s): ${athlete.positions}\n` : ""}${
    athlete.gpa ? `- GPA: ${athlete.gpa}\n` : ""
  }- Stats: ${JSON.stringify(athlete.stats)}
- Achievements: ${athlete.achievements.join("; ") || "None listed"}
${
  athlete.international
    ? `- Club/Academy: ${athlete.international.clubOrAcademy ?? "N/A"}
- Eligibility status: ${athlete.international.eligibilityStatus ?? "N/A"}
- English proficiency: ${athlete.international.englishProficiency ?? "N/A"}`
    : ""
}

Based ONLY on the information given, assess which NCAA division (D1, D2, D3, or NAIA) is the most realistic target for this athlete right now. Be honest — do not inflate the assessment. Respond with ONLY a JSON object (no markdown fences, no commentary) matching exactly this shape:

{
  "division": "one of: D1, D2, D3, NAIA",
  "confidence": "one of: Low, Moderate, High",
  "reasoning": "a 3-5 sentence honest explanation referencing the specific details given"
}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: prompt }],
  });

  const parsed = extractJson(textFromMessage(message)) as Omit<
    DivisionMatch,
    "generatedAt"
  >;

  return { ...parsed, generatedAt: new Date().toISOString() };
}
