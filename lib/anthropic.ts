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

export interface BannerCropRect {
  /** All fields are percentages (0-100) of the image, AFTER `rotation`
   * (if any) has been applied. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees to rotate the image clockwise before cropping, if it was
   * saved sideways/upside-down (e.g. a phone photo with no orientation
   * metadata) -- 0 if it's already upright. */
  rotation?: 0 | 90 | 180 | 270;
  /** Whether the athlete's face is visible anywhere in the source photo. */
  faceVisible?: boolean;
  /** Center of the athlete's face, as percentages of the (post-rotation)
   * image -- only meaningful when faceVisible is true. Reported
   * independently of the crop rect above so the crop can be verified (and
   * corrected) against it: the model sometimes says a face is visible but
   * centers the rect elsewhere (e.g. on the ball or torso), cutting the
   * face out despite its own answer. */
  faceX?: number;
  faceY?: number;
}

/**
 * Asks Claude where to crop a banner photo so the athlete is actually the
 * subject of the shot -- centered on their face if they're close/prominent
 * enough for it to read clearly, or their body if they're distant (e.g. a
 * wide action shot where the face would be too small to anchor on).
 */
export async function analyzeBannerCrop(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<BannerCropRect> {
  const client = getClient();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1536,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: `This is a banner photo for an athlete's recruiting profile.

STEP 1 — Orientation. Some phone photos get saved sideways or upside-down with no metadata to auto-correct them. Before anything else, locate the primary athlete's head and feet in the image AS GIVEN. If their head-to-feet axis runs sideways (e.g. their head is near the left or right edge of the frame instead of near the top), the photo is rotated and needs correcting. Explicitly note where the head and feet currently are, then report how many degrees CLOCKWISE the image must be rotated so the athlete stands upright: 0, 90, 180, or 270.

STEP 2 — Crop. After that rotation is applied, find the primary athlete (usually the most prominent person, often mid-action) and choose a crop rectangle that keeps them the clear subject, described relative to how the image looks AFTER rotation.

Face visibility is the top priority, above action or context:
- If the athlete's face is visible in the photo AT ALL — even partially, at an angle, mid-motion, or not perfectly sharp — the crop MUST include their face. Frame it like a portrait-with-action-context shot: their face and upper body clearly in view, not zoomed out so far the face becomes a tiny unreadable dot.
- Only fall back to a distant body/torso-only framing in the rare case where the athlete's face is not visible anywhere in the source photo at all (e.g. they are fully turned away from the camera, or the photo is too low-resolution/far away for a face to exist in the frame at any crop).
- Never sacrifice a visible face for the sake of showing more action or context — if you can only fit one, the face wins.
- When the primary athlete is grappling/competing against an opponent (e.g. wrestling), crop tightly around the primary athlete so THEIR face is prominent -- don't widen the frame just to fit the opponent in equally, treat the opponent as background/context only.
- The crop should have a wide aspect ratio, roughly between 2.4:1 and 3:1 (width:height).
- Don't cut off their head or crop so tight that jersey number/action context is entirely lost, but do not let that override the face-visibility rule above.
- x, y, width, and height are all PERCENTAGES of the (post-rotation) image, on a 0-100 scale (NOT 0-1). x/y is the top-left corner of the crop. For example, a crop starting a quarter of the way down the image, spanning the full width and half the height, would be {"x": 0, "y": 25, "width": 100, "height": 50}.
- Separately from the crop rect, also report faceX/faceY: the center point of the athlete's face (as percentages of the same post-rotation image), whenever faceVisible is true. Double check that this point actually falls inside the crop rect you chose above -- if it doesn't, fix the rect before answering.

Respond with ONLY a JSON object (no markdown fences, no commentary) matching exactly this shape:

{"rotation": 0, "x": number, "y": number, "width": number, "height": number, "faceVisible": boolean, "faceX": number, "faceY": number, "reasoning": "one short sentence covering both the orientation check and the face-visibility decision"}`,
          },
        ],
      },
    ],
  });

  const parsed = extractJson(textFromMessage(message)) as BannerCropRect & {
    reasoning?: string;
  };

  return {
    x: parsed.x,
    y: parsed.y,
    width: parsed.width,
    height: parsed.height,
    rotation: parsed.rotation,
    faceVisible: parsed.faceVisible,
    faceX: parsed.faceX,
    faceY: parsed.faceY,
  };
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
