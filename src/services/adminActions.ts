"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminActionResult {
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

export async function createCompanyAccountAction(
  _prev: AdminActionResult,
  formData: FormData
): Promise<AdminActionResult> {
  const supabase = await createClient();
  const check = await requireAdmin(supabase);
  if ("error" in check) return { error: check.error };

  const email = String(formData.get("email") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email) return { error: "Enter the company rep's email." };
  if (!displayName) return { error: "Enter a contact name for the account." };

  const adminClient = createAdminClient();
  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
  });

  if (inviteError || !invited.user) {
    return { error: inviteError?.message ?? "Something went wrong creating that account." };
  }

  const { error: roleError } = await supabase
    .from("profiles")
    .update({ role: "company" })
    .eq("id", invited.user.id);

  if (roleError) return { error: "Account created, but something went wrong setting its role." };

  revalidatePath("/admin");
  return { success: true };
}
