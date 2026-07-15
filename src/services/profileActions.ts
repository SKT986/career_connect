"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileActionState {
  error?: string;
  success?: boolean;
}

const MAX_DISPLAY_NAME_LENGTH = 60;
const MAX_BIO_LENGTH = 500;

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;

  if (!displayName) return { error: "Add a display name." };
  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return { error: `Display name must be under ${MAX_DISPLAY_NAME_LENGTH} characters.` };
  }
  if (bio.length > MAX_BIO_LENGTH) {
    return { error: `Bio must be under ${MAX_BIO_LENGTH} characters.` };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio: bio || null, avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) return { error: "Something went wrong saving your profile." };

  revalidatePath("/profile");
  revalidatePath("/profile", "layout");
  return { success: true };
}
