import { createClient } from "@/lib/supabase/server";
import type { NotificationItem } from "@/types/domain";

export async function getNotifications(userId: string, limit = 30): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, payload, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    payload: row.payload,
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw error;
  return count ?? 0;
}

// Mirrors the author-label logic in postsService.getCommentsForPost: a
// mentor only gets the "mentor_comment" treatment when replying
// non-anonymously — an anonymous mentor reply is just a regular reply.
export async function createReplyNotification(params: {
  postId: string;
  postAuthorId: string;
  commenterId: string;
  isAnonymous: boolean;
  commentExcerpt: string;
}): Promise<void> {
  if (params.postAuthorId === params.commenterId) return;

  const supabase = await createClient();
  const { data: recipient } = await supabase
    .from("profiles")
    .select("notifications_enabled")
    .eq("id", params.postAuthorId)
    .maybeSingle();
  if (recipient && !recipient.notifications_enabled) return;

  const { data: commenter } = await supabase
    .from("profiles")
    .select("display_name, anonymous_alias, role")
    .eq("id", params.commenterId)
    .maybeSingle();

  const isMentorReply = !params.isAnonymous && commenter?.role === "mentor";
  const authorLabel =
    params.isAnonymous || !commenter ? (commenter?.anonymous_alias ?? "Someone") : commenter.display_name;

  const { error } = await supabase.from("notifications").insert({
    user_id: params.postAuthorId,
    type: isMentorReply ? "mentor_comment" : "reply",
    payload: {
      postId: params.postId,
      authorLabel,
      excerpt: params.commentExcerpt.slice(0, 140),
    },
  });
  if (error) console.error("createReplyNotification insert failed:", error.message);
}

export async function createCompanyInvitationNotification(params: {
  studentId: string;
  companyName: string;
}): Promise<void> {
  const supabase = await createClient();
  const { data: recipient } = await supabase
    .from("profiles")
    .select("notifications_enabled")
    .eq("id", params.studentId)
    .maybeSingle();
  if (recipient && !recipient.notifications_enabled) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: params.studentId,
    type: "company_invitation",
    payload: { companyName: params.companyName },
  });
  if (error) console.error("createCompanyInvitationNotification insert failed:", error.message);
}
