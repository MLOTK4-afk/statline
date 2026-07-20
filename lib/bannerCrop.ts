import sharp from "sharp";
import { analyzeBannerCrop } from "@/lib/anthropic";

const SUPPORTED_MEDIA_TYPES: Record<
  string,
  "image/jpeg" | "image/png" | "image/webp"
> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};

/**
 * Re-crops a banner photo so the athlete is the clear subject, using Claude
 * to locate them (face if close/prominent enough, body if distant) and
 * sharp to apply the crop. Never throws -- if analysis or cropping fails or
 * returns something implausible, returns the original buffer untouched so a
 * banner upload can never hard-fail because of this.
 */
export async function cropBannerImage(
  buffer: Buffer,
  contentType: string
): Promise<Buffer> {
  const mediaType = SUPPORTED_MEDIA_TYPES[contentType];
  if (!mediaType) return buffer;

  try {
    const rect = await analyzeBannerCrop(buffer.toString("base64"), mediaType);

    // Claude sometimes answers on a 0-1 fractional scale despite the prompt
    // asking for 0-100 percentages. A valid percentage crop always has
    // width/height >= 10, so if both come back <= 1 they're almost
    // certainly fractions -- rescale the whole rect before validating.
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
      console.error("[bannerCrop] rejected rect from Claude:", rect);
      return buffer;
    }

    // Some phone photos are saved sideways/upside-down with no orientation
    // metadata to auto-correct them -- rotate first (if needed) so the crop
    // percentages, which Claude reported relative to the upright image,
    // land in the right place.
    const rotation = rect.rotation ?? 0;
    const oriented =
      rotation === 90 || rotation === 180 || rotation === 270
        ? await sharp(buffer).rotate(rotation).toBuffer()
        : buffer;

    const { width, height } = await sharp(oriented).metadata();
    if (!width || !height) return buffer;

    // Claude's rect can land far from the ~2.4:1-3:1 wide ratio we asked
    // for despite the prompt -- every surface renders this with CSS
    // background-size:cover, which zooms uncontrollably into whatever we
    // hand it, so the aspect ratio has to be enforced here rather than
    // trusted from the model's freeform answer. Recompute height from the
    // (fixed) width and the image's real pixel aspect ratio, recentering
    // on the original vertical midpoint.
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

    return await sharp(oriented)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .toBuffer();
  } catch (err) {
    console.error("[bannerCrop] failed:", err);
    return buffer;
  }
}
