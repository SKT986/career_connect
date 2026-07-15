import { createClient } from "@/lib/supabase/server";
import type { ProfileSummary } from "@/types/domain";

export async function getMyProfile(userId: string): Promise<ProfileSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, display_name, university_email, avatar_url, bio, default_anonymous, notifications_enabled, created_at"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    role: data.role,
    displayName: data.display_name,
    universityEmail: data.university_email,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    defaultAnonymous: data.default_anonymous,
    notificationsEnabled: data.notifications_enabled,
    createdAt: data.created_at,
  };
}

export async function getViewerPreferences(): Promise<{ userId: string | null; defaultAnonymous: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, defaultAnonymous: true };

  const { data } = await supabase.from("profiles").select("default_anonymous").eq("id", user.id).maybeSingle();
  return { userId: user.id, defaultAnonymous: data?.default_anonymous ?? true };
}
