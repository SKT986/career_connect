import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const ALLOWED_BUCKETS = ["post-images", "avatars"] as const;
type Bucket = (typeof ALLOWED_BUCKETS)[number];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const bucketField = String(formData.get("bucket") ?? "post-images");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
  }
  if (!ALLOWED_BUCKETS.includes(bucketField as Bucket)) {
    return NextResponse.json({ error: "Invalid upload destination" }, { status: 400 });
  }
  const bucket = bucketField as Bucket;
  const isAvatar = bucket === "avatars";

  const extension = file.type.split("/")[1];
  const path = isAvatar ? `${user.id}/avatar.${extension}` : `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: isAvatar });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  if (isAvatar) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: `${data.publicUrl}?v=${Date.now()}`, path });
  }

  const { data: signedData, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (signError || !signedData) {
    return NextResponse.json({ error: "Could not generate image URL" }, { status: 500 });
  }

  return NextResponse.json({ url: signedData.signedUrl, path });
}
