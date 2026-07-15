"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface MentorActionState {
  error?: string;
  success?: boolean;
}

const MAX_HEADLINE_LENGTH = 140;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;

async function requireMentor(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "mentor") return { error: "Only mentors can do this." as const };

  return { userId: user.id };
}

export async function upsertMentorProfileAction(
  _prev: MentorActionState,
  formData: FormData
): Promise<MentorActionState> {
  const supabase = await createClient();
  const check = await requireMentor(supabase);
  if ("error" in check) return { error: check.error };

  const headline = String(formData.get("headline") ?? "").trim();
  if (!headline) return { error: "Add a short headline about what you help with." };
  if (headline.length > MAX_HEADLINE_LENGTH) {
    return { error: `Headline must be under ${MAX_HEADLINE_LENGTH} characters.` };
  }

  const { error } = await supabase
    .from("mentor_profiles")
    .upsert({ profile_id: check.userId, headline }, { onConflict: "profile_id" });

  if (error) return { error: "Something went wrong saving your mentor profile." };

  revalidatePath("/mentors");
  return { success: true };
}

export async function createAmaSessionAction(
  _prev: MentorActionState,
  formData: FormData
): Promise<MentorActionState> {
  const supabase = await createClient();
  const check = await requireMentor(supabase);
  if ("error" in check) return { error: check.error };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scheduledAt = String(formData.get("scheduledAt") ?? "");

  if (!title) return { error: "Give your AMA a title." };
  if (title.length > MAX_TITLE_LENGTH) return { error: `Title must be under ${MAX_TITLE_LENGTH} characters.` };
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description must be under ${MAX_DESCRIPTION_LENGTH} characters.` };
  }
  if (!scheduledAt) return { error: "Choose a date and time." };

  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) return { error: "That date and time isn't valid." };
  if (scheduledDate.getTime() < Date.now()) return { error: "Choose a time in the future." };

  const { error } = await supabase.from("mentor_sessions").insert({
    mentor_id: check.userId,
    title,
    description: description || null,
    scheduled_at: scheduledDate.toISOString(),
  });

  if (error) return { error: "Something went wrong scheduling your AMA." };

  revalidatePath("/mentors");
  return { success: true };
}
