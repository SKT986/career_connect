import { createClient } from "@/lib/supabase/server";
import type { AmaSession, MentorProfileSummary } from "@/types/domain";

export async function getVerifiedMentors(): Promise<MentorProfileSummary[]> {
  const supabase = await createClient();
  const { data: mentorProfiles, error } = await supabase
    .from("mentor_profiles")
    .select("profile_id, headline, badges, is_verified")
    .eq("is_verified", true);

  if (error) throw error;
  if (mentorProfiles.length === 0) return [];

  const profileIds = mentorProfiles.map((m) => m.profile_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", profileIds);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return mentorProfiles.map((m) => ({
    profileId: m.profile_id,
    displayName: nameById.get(m.profile_id) ?? "Mentor",
    headline: m.headline,
    badges: m.badges,
    isVerified: m.is_verified,
  }));
}

export async function getUpcomingAmaSessions(): Promise<AmaSession[]> {
  const supabase = await createClient();
  const { data: sessions, error } = await supabase
    .from("mentor_sessions")
    .select("id, mentor_id, title, description, scheduled_at")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  if (sessions.length === 0) return [];

  const mentorIds = Array.from(new Set(sessions.map((s) => s.mentor_id)));
  const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", mentorIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return sessions.map((s) => ({
    id: s.id,
    mentorId: s.mentor_id,
    mentorName: nameById.get(s.mentor_id) ?? "Mentor",
    title: s.title,
    description: s.description,
    scheduledAt: s.scheduled_at,
  }));
}

export async function getMyMentorProfile(): Promise<MentorProfileSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "mentor") return null;

  const { data: mentorProfile } = await supabase
    .from("mentor_profiles")
    .select("profile_id, headline, badges, is_verified")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!mentorProfile) return null;

  return {
    profileId: mentorProfile.profile_id,
    displayName: profile.display_name,
    headline: mentorProfile.headline,
    badges: mentorProfile.badges,
    isVerified: mentorProfile.is_verified,
  };
}

export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role ?? null;
}
