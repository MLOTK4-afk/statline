// Re-crops every athlete's existing banner photo so the athlete is the
// clearly-framed subject (face if close/prominent enough, body if
// distant), fixing profiles uploaded before auto-cropping existed.
// Self-contained (mirrors lib/anthropic.ts's analyzeBannerCrop and
// lib/bannerCrop.ts's cropBannerImage) since this runs as a plain Node
// script outside Next.js, where "@/" path aliases don't resolve.
//
// Talks to Supabase with the same anon-key client the app already uses
// server-side -- RLS on `athletes` is fully permissive for anon, so no
// admin account is needed. Old (un-cropped) images are left in storage
// rather than deleted, so this stays a reversible, additive operation.
//
// Usage: node scripts/recrop-banners.mjs
import { promises as fs } from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

async function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = await fs.readFile(envPath, "utf-8").catch(() => "");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

await loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local."
  );
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-6";
const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.trim());
}

async function analyzeBannerCrop(imageBase64, mediaType) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
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

First, check orientation: some phone photos get saved sideways or upside-down with no metadata to auto-correct them. If the image needs rotating to look upright (e.g. people/the horizon are sideways), report how many degrees CLOCKWISE it needs to rotate to become upright: 0, 90, 180, or 270.

Then, find the primary athlete in the image (usually the most prominent person, often mid-action) and return a crop rectangle that keeps them the clear subject of the photo, described relative to how the image will look AFTER that rotation is applied.

- If their face is close/large enough in the frame to read clearly at a small size, center the crop on their face.
- If they're captured from a distance (e.g. a wide action shot on a field or court) where the face would be too small to anchor on, center the crop on their body/torso instead.
- The crop should have a wide aspect ratio, roughly between 2.4:1 and 3:1 (width:height).
- Don't cut off their head or crop so tight that context (jersey number, action) is lost.
- x, y, width, and height are all PERCENTAGES of the (post-rotation) image, on a 0-100 scale (NOT 0-1). x/y is the top-left corner of the crop. For example, a crop starting a quarter of the way down the image, spanning the full width and half the height, would be {"x": 0, "y": 25, "width": 100, "height": 50}.

Respond with ONLY a JSON object (no markdown fences, no commentary) matching exactly this shape:

{"rotation": 0, "x": number, "y": number, "width": number, "height": number, "reasoning": "one short sentence"}`,
          },
        ],
      },
    ],
  });
  const block = message.content.find((b) => b.type === "text");
  if (!block) throw new Error("No text block in Claude response.");
  return extractJson(block.text);
}

/** Returns the SAME buffer reference if cropping was skipped/failed, or a
 * new buffer if it succeeded -- callers can tell them apart with `===`. */
async function cropBannerImage(buffer, contentType) {
  const mediaType = { "image/jpeg": "image/jpeg", "image/png": "image/png", "image/webp": "image/webp" }[
    contentType
  ];
  if (!mediaType) return buffer;

  const rect = await analyzeBannerCrop(buffer.toString("base64"), mediaType);

  // Claude sometimes answers on a 0-1 fractional scale despite the prompt
  // asking for 0-100 percentages. A valid percentage crop always has
  // width/height >= 10, so if both come back <= 1 they're almost certainly
  // fractions -- rescale the whole rect before validating.
  if (rect.width <= 1 && rect.height <= 1) {
    rect.x *= 100;
    rect.y *= 100;
    rect.width *= 100;
    rect.height *= 100;
  }

  const valid =
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width >= 10 &&
    rect.width <= 100 &&
    rect.height >= 10 &&
    rect.height <= 100 &&
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.width <= 100 &&
    rect.y + rect.height <= 100;
  if (!valid) return buffer;

  // Some phone photos are saved sideways/upside-down with no orientation
  // metadata -- rotate first (if needed) so the crop percentages, reported
  // relative to the upright image, land in the right place.
  const rotation = rect.rotation ?? 0;
  const oriented =
    rotation === 90 || rotation === 180 || rotation === 270
      ? await sharp(buffer).rotate(rotation).toBuffer()
      : buffer;

  const { width, height } = await sharp(oriented).metadata();
  if (!width || !height) return buffer;

  // Claude's rect can land far from the ~2.4:1-3:1 wide ratio we asked for
  // despite the prompt -- every surface renders this with CSS
  // background-size:cover, which zooms uncontrollably into whatever we
  // hand it, so the aspect ratio has to be enforced here rather than
  // trusted from the model's freeform answer. Recompute height from the
  // (fixed) width and the image's real pixel aspect ratio, recentering on
  // the original vertical midpoint.
  const TARGET_ASPECT = 2.7;
  const imageAspect = width / height;
  const pixelAspect = (rect.width / rect.height) * imageAspect;
  if (pixelAspect < 2.2 || pixelAspect > 3.2) {
    const centerY = rect.y + rect.height / 2;
    let newHeight = (rect.width * imageAspect) / TARGET_ASPECT;
    newHeight = Math.min(100, Math.max(10, newHeight));
    rect.y = Math.max(0, Math.min(centerY - newHeight / 2, 100 - newHeight));
    rect.height = newHeight;
  }

  const left = Math.round((rect.x / 100) * width);
  const top = Math.round((rect.y / 100) * height);
  const cropWidth = Math.round((rect.width / 100) * width);
  const cropHeight = Math.round((rect.height / 100) * height);

  const cropped = await sharp(oriented)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .toBuffer();
  return { buffer: cropped, reasoning: rect.reasoning };
}

/** Finds the original (pre-recrop) banner object for an athlete, so a
 * re-run recrops from the real source photo instead of compounding
 * crop-on-top-of-crop quality loss from a previous run's output. Falls
 * back to the current banner_url if no such original can be found. */
async function findOriginalBannerUrl(athleteId, currentBannerUrl) {
  const { data: files, error } = await supabase.storage
    .from("athlete-banners")
    .list(athleteId);
  if (error || !files || files.length === 0) return currentBannerUrl;

  const originals = files.filter((f) => !f.name.includes("-recrop"));
  if (originals.length === 0) return currentBannerUrl;

  originals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const { data } = supabase.storage
    .from("athlete-banners")
    .getPublicUrl(`${athleteId}/${originals[0].name}`);
  return data.publicUrl;
}

async function main() {
  console.log("Fetching athletes with a bannerUrl...");
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name, banner_url")
    .not("banner_url", "is", null);
  if (error) {
    console.error("Failed to list athletes:", error.message);
    process.exit(1);
  }
  console.log(`Found ${athletes.length} athlete(s) with a banner.\n`);

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const athlete of athletes) {
    process.stdout.write(`${athlete.name} (${athlete.id}) ... `);
    try {
      const sourceUrl = await findOriginalBannerUrl(athlete.id, athlete.banner_url);
      const res = await fetch(sourceUrl);
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const buffer = Buffer.from(await res.arrayBuffer());

      const result = await cropBannerImage(buffer, contentType);
      if (result === buffer) {
        console.log("skipped (crop analysis declined or unusable)");
        skipped++;
        continue;
      }

      const ext = EXT_BY_TYPE[contentType] ?? "jpg";
      const objectPath = `${athlete.id}/${Date.now()}-recrop.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("athlete-banners")
        .upload(objectPath, result.buffer, { contentType, upsert: true });
      if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from("athlete-banners").getPublicUrl(objectPath);

      const { error: updateError } = await supabase
        .from("athletes")
        .update({ banner_url: publicUrl })
        .eq("id", athlete.id);
      if (updateError) throw new Error(`db update failed: ${updateError.message}`);

      console.log(`done (${result.reasoning ?? "no reasoning given"})`);
      succeeded++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${succeeded} re-cropped, ${skipped} skipped, ${failed} failed.`);
}

await main();
