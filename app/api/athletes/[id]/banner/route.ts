import { NextResponse } from "next/server";
import { store } from "@/lib/storage";
import { getDeviceToken } from "@/lib/deviceToken";
import { canEditAthlete } from "@/lib/canEditAthlete";
import { createClient } from "@/lib/supabase/server";
import { cropBannerImage } from "@/lib/bannerCrop";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const existing = await store.getAthlete(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ownerToken = await getDeviceToken();
  if (!(await canEditAthlete(ownerToken, existing.ownerToken))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPG, PNG, or WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (5MB max)." },
      { status: 400 }
    );
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  // Auto-frame the athlete (face if close/prominent, body if distant) so
  // every render surface can just center-crop instead of guessing an
  // anchor point per photo. Falls back to the untouched upload on failure.
  const croppedBuffer = await cropBannerImage(rawBuffer, file.type);

  const supabase = await createClient();
  const path = `${params.id}/${Date.now()}.${EXT_BY_TYPE[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from("athlete-banners")
    .upload(path, croppedBuffer, { contentType: file.type, upsert: true });
  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 502 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("athlete-banners").getPublicUrl(path);

  const updated = await store.updateAthlete(params.id, {
    bannerUrl: publicUrl,
  });
  return NextResponse.json(updated);
}
