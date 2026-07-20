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
    // Auto-orient using embedded EXIF data first, deterministically. Phone
    // photos are often stored in landscape byte order with an EXIF
    // Orientation tag saying how to display them upright -- Claude's vision
    // API appears to already correct for this before the model "sees" the
    // image, but our own pixel math doesn't unless we do the same
    // correction here. Skipping this step is what caused crop percentages
    // (computed against the corrected image) to be applied to the wrong,
    // still-rotated pixel grid.
    const autoOriented = await sharp(buffer).rotate().toBuffer();

    const rect = await analyzeBannerCrop(
      autoOriented.toString("base64"),
      mediaType
    );

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
      return autoOriented;
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
    if (!width || !height) return autoOriented;

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

    // Claude sometimes says a face is visible but centers the rect
    // elsewhere anyway (e.g. on the ball or torso), cutting the face out
    // despite its own answer. It reports the face's actual position
    // separately, so use that as a hard guarantee: shift the box (without
    // resizing it) until the face point falls inside, rather than trusting
    // rect placement alone.
    if (
      rect.faceVisible &&
      Number.isFinite(rect.faceX) &&
      Number.isFinite(rect.faceY) &&
      rect.faceX! >= 0 &&
      rect.faceX! <= 100 &&
      rect.faceY! >= 0 &&
      rect.faceY! <= 100
    ) {
      const margin = Math.min(3, rect.height / 4);
      if (rect.faceY! < rect.y + margin) {
        rect.y = Math.max(0, Math.min(rect.faceY! - margin, 100 - rect.height));
      } else if (rect.faceY! > rect.y + rect.height - margin) {
        rect.y = Math.max(0, Math.min(rect.faceY! - rect.height + margin, 100 - rect.height));
      }
      const marginX = Math.min(3, rect.width / 4);
      if (rect.faceX! < rect.x + marginX) {
        rect.x = Math.max(0, Math.min(rect.faceX! - marginX, 100 - rect.width));
      } else if (rect.faceX! > rect.x + rect.width - marginX) {
        rect.x = Math.max(0, Math.min(rect.faceX! - rect.width + marginX, 100 - rect.width));
      }
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
