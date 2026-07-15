"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface AdminActionResult {
  error?: string;
  success?: boolean;
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { error: "Only admins can do this." as const };

  return { userId: user.id };
}

export async function promoteToMentorAction(profileId: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const check = await requireAdmin(supabase);
  if ("error" in check) return { error: check.error };

  const { error } = await supabase.from("profiles").update({ role: "mentor" }).eq("id", profileId);
  if (error) return { error: "Something went wrong promoting this student." };

  revalidatePath("/admin");
  return { success: true };
}

export async function demoteMentorAction(profileId: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const check = await requireAdmin(supabase);
  if ("error" in check) return { error: check.error };

  const { error } = await supabase.from("profiles").update({ role: "student" }).eq("id", profileId);
  if (error) return { error: "Something went wrong demoting this mentor." };

  revalidatePath("/admin");
  return { success: true };
}

export async function verifyMentorAction(profileId: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const check = await requireAdmin(supabase);
  if ("error" in check) return { error: check.error };

  const { error } = await supabase
    .from("mentor_profiles")
    .update({ is_verified: true })
    .eq("profile_id", profileId);
  if (error) return { error: "Something went wrong verifying this mentor." };

  revalidatePath("/admin");
  revalidatePath("/mentors");
  return { success: true };
}

export async function revokeMentorVerificationAction(profileId: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const check = await requireAdmin(supabase);
  if ("error" in check) return { error: check.error };

  const { error } = await supabase
    .from("mentor_profiles")
    .update({ is_verified: false })
    .eq("profile_id", profileId);
  if (error) return { error: "Something went wrong revoking this mentor's verification." };

  revalidatePath("/admin");
  revalidatePath("/mentors");
  return { success: true };
}
