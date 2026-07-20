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
- Never sacrifice a visible face for the sake of showing more action or context -- if you can only fit one, the face wins.
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
  const block = message.content.find((b) => b.type === "text");
  if (!block) throw new Error("No text block in Claude response.");
  return extractJson(block.text);
}

/** Returns the SAME buffer reference only if cropping was skipped outright
 * (unsupported media type) -- callers can detect that case with `===`.
 * Otherwise returns `{ buffer, reasoning }`, which is always at least
 * EXIF-orientation-corrected even if the AI crop itself was rejected. */
async function cropBannerImage(buffer, contentType) {
  const mediaType = { "image/jpeg": "image/jpeg", "image/png": "image/png", "image/webp": "image/webp" }[
    contentType
  ];
  if (!mediaType) return buffer;

  // Auto-orient using embedded EXIF data first, deterministically. Phone
  // photos are often stored in landscape byte order with an EXIF
  // Orientation tag saying how to display them upright -- Claude's vision
  // API appears to already correct for this before the model "sees" the
  // image, but our own pixel math doesn't unless we do the same correction
  // here. Skipping this step is what caused crop percentages (computed
  // against the corrected image) to be applied to the wrong, still-rotated
  // pixel grid.
  const autoOriented = await sharp(buffer).rotate().toBuffer();

  const rect = await analyzeBannerCrop(autoOriented.toString("base64"), mediaType);

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
  if (!valid) {
    return { buffer: autoOriented, reasoning: "orientation-corrected only (crop rejected)" };
  }

  // Rare fallback: a photo with no EXIF orientation data at all that's
  // still genuinely sideways. Claude's rotation field (relative to the
  // already-EXIF-corrected image above) covers that case.
  const rotation = rect.rotation ?? 0;
  const oriented =
    rotation === 90 || rotation === 180 || rotation === 270
      ? await sharp(autoOriented).rotate(rotation).toBuffer()
      : autoOriented;

  const { width, height } = await sharp(oriented).metadata();
  if (!width || !height) {
    return { buffer: autoOriented, reasoning: "orientation-corrected only (no metadata)" };
  }

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

  // Claude sometimes says a face is visible but centers the rect elsewhere
  // anyway (e.g. on the ball or torso), cutting the face out despite its
  // own answer. It reports the face's actual position separately, so use
  // that as a hard guarantee: shift the box (without resizing it) until
  // the face point falls inside, rather than trusting rect placement alone.
  if (
    rect.faceVisible &&
    Number.isFinite(rect.faceX) &&
    Number.isFinite(rect.faceY) &&
    rect.faceX >= 0 &&
    rect.faceX <= 100 &&
    rect.faceY >= 0 &&
    rect.faceY <= 100
  ) {
    const margin = Math.min(3, rect.height / 4);
    if (rect.faceY < rect.y + margin) {
      rect.y = Math.max(0, Math.min(rect.faceY - margin, 100 - rect.height));
    } else if (rect.faceY > rect.y + rect.height - margin) {
      rect.y = Math.max(0, Math.min(rect.faceY - rect.height + margin, 100 - rect.height));
    }
    const marginX = Math.min(3, rect.width / 4);
    if (rect.faceX < rect.x + marginX) {
      rect.x = Math.max(0, Math.min(rect.faceX - marginX, 100 - rect.width));
    } else if (rect.faceX > rect.x + rect.width - marginX) {
      rect.x = Math.max(0, Math.min(rect.faceX - rect.width + marginX, 100 - rect.width));
    }
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
