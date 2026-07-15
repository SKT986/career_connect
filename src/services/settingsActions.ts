"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SettingsActionState {
  error?: string;
  success?: boolean;
}

export async function updatePreferencesAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const defaultAnonymous = formData.get("defaultAnonymous") === "true";
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({ default_anonymous: defaultAnonymous, notifications_enabled: notificationsEnabled })
    .eq("id", user.id);

  if (error) return { error: "Something went wrong saving your preferences." };

  revalidatePath("/settings");
  return { success: true };
}

const MIN_PASSWORD_LENGTH = 8;

export async function updatePasswordAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { success: true };
}
