import { createClient } from "@/lib/supabase/server";
import { POST_CATEGORIES } from "@/lib/nav";
import type {
  AdminOverviewStats,
  CategoryBreakdownPoint,
  DailyActivityPoint,
  PendingMentorProfile,
  PromotableStudent,
} from "@/types/domain";

const ACTIVITY_WINDOW_DAYS = 14;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: newUsersLast7Days },
    { count: totalPosts },
    { count: totalComments },
    { count: verifiedMentors },
    { count: pendingMentorVerifications },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("mentor_profiles").select("*", { count: "exact", head: true }).eq("is_verified", true),
    supabase.from("mentor_profiles").select("*", { count: "exact", head: true }).eq("is_verified", false),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    newUsersLast7Days: newUsersLast7Days ?? 0,
    totalPosts: totalPosts ?? 0,
    totalComments: totalComments ?? 0,
    verifiedMentors: verifiedMentors ?? 0,
    pendingMentorVerifications: pendingMentorVerifications ?? 0,
  };
}

export async function getDailyActivity(): Promise<DailyActivityPoint[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (ACTIVITY_WINDOW_DAYS - 1));
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  const [{ data: posts }, { data: comments }, { data: likes }] = await Promise.all([
    supabase.from("posts").select("author_id, created_at").gte("created_at", sinceIso),
    supabase.from("comments").select("author_id, created_at").gte("created_at", sinceIso),
    supabase.from("likes").select("user_id, created_at").gte("created_at", sinceIso),
  ]);

  const days = lastNDays(ACTIVITY_WINDOW_DAYS);
  const activeUsersByDay = new Map<string, Set<string>>(days.map((d) => [d, new Set<string>()]));
  const postsByDay = new Map<string, number>(days.map((d) => [d, 0]));
  const commentsByDay = new Map<string, number>(days.map((d) => [d, 0]));

  for (const post of posts ?? []) {
    const key = dayKey(post.created_at);
    activeUsersByDay.get(key)?.add(post.author_id);
    postsByDay.set(key, (postsByDay.get(key) ?? 0) + 1);
  }
  for (const comment of comments ?? []) {
    const key = dayKey(comment.created_at);
    activeUsersByDay.get(key)?.add(comment.author_id);
    commentsByDay.set(key, (commentsByDay.get(key) ?? 0) + 1);
  }
  for (const like of likes ?? []) {
    const key = dayKey(like.created_at);
    activeUsersByDay.get(key)?.add(like.user_id);
  }

  return days.map((date) => ({
    date,
    activeUsers: activeUsersByDay.get(date)?.size ?? 0,
    posts: postsByDay.get(date) ?? 0,
    comments: commentsByDay.get(date) ?? 0,
  }));
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdownPoint[]> {
  const supabase = await createClient();

  const counts = await Promise.all(
    POST_CATEGORIES.map(async ({ value }) => {
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category", value);
      return { category: value, count: count ?? 0 } as CategoryBreakdownPoint;
    })
  );

  return counts.filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
}

export async function getPendingMentorVerifications(): Promise<PendingMentorProfile[]> {
  const supabase = await createClient();
  const { data: pending, error } = await supabase
    .from("mentor_profiles")
    .select("profile_id, headline, created_at")
    .eq("is_verified", false)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!pending || pending.length === 0) return [];

  const profileIds = pending.map((p) => p.profile_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, university_email")
    .in("id", profileIds);

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return pending.map((p) => ({
    profileId: p.profile_id,
    displayName: byId.get(p.profile_id)?.display_name ?? "Unknown",
    universityEmail: byId.get(p.profile_id)?.university_email ?? null,
    headline: p.headline,
    createdAt: p.created_at,
  }));
}

export async function searchPromotableStudents(query: string): Promise<PromotableStudent[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, university_email")
    .eq("role", "student")
    .or(`display_name.ilike.%${trimmed}%,university_email.ilike.%${trimmed}%`)
    .limit(10);

  if (error) throw error;

  return (data ?? []).map((p) => ({
    profileId: p.id,
    displayName: p.display_name,
    universityEmail: p.university_email,
  }));
}
