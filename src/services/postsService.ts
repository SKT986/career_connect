import { createClient } from "@/lib/supabase/server";
import type { PostCategory } from "@/types/database.types";
import type { FeedComment, FeedPost } from "@/types/domain";

// Deliberately avoids Postgrest embedded resource syntax (`profiles!fk(...)`,
// `likes(count)`) — our hand-authored Database type doesn't carry real FK
// relationship metadata, which the embedded-select parser needs, so those
// queries silently type as `never`. Flat queries + in-memory joins sidestep
// that entirely and are plenty fast at this scale.

export async function getFeedPosts({
  category,
  search,
}: {
  category?: PostCategory | "all";
  search?: string;
} = {}): Promise<FeedPost[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select("id, category, content, image_url, created_at, is_anonymous, author_id")
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (search && search.trim()) {
    query = query.textSearch("search_vector", search.trim(), { type: "websearch" });
  }

  const { data: posts, error } = await query;
  if (error) throw error;
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const authorIds = Array.from(new Set(posts.map((p) => p.author_id)));

  const [{ data: profiles }, { data: likeRows }, { data: commentRows }, { data: likedRows }, { data: bookmarkedRows }] =
    await Promise.all([
      supabase.from("profiles").select("id, display_name, anonymous_alias, avatar_url").in("id", authorIds),
      supabase.from("likes").select("post_id").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
      user
        ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
      user
        ? supabase.from("bookmarks").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const likeCountByPost = new Map<string, number>();
  for (const row of likeRows ?? []) {
    likeCountByPost.set(row.post_id, (likeCountByPost.get(row.post_id) ?? 0) + 1);
  }
  const commentCountByPost = new Map<string, number>();
  for (const row of commentRows ?? []) {
    commentCountByPost.set(row.post_id, (commentCountByPost.get(row.post_id) ?? 0) + 1);
  }
  const likedSet = new Set((likedRows ?? []).map((r) => r.post_id));
  const bookmarkedSet = new Set((bookmarkedRows ?? []).map((r) => r.post_id));

  return posts.map((row) => {
    const profile = profileById.get(row.author_id);
    const authorLabel = row.is_anonymous || !profile ? (profile?.anonymous_alias ?? "Anonymous") : profile.display_name;

    return {
      id: row.id,
      category: row.category,
      content: row.content,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      isAnonymous: row.is_anonymous,
      authorId: row.author_id,
      authorLabel,
      authorAvatarUrl: row.is_anonymous ? null : (profile?.avatar_url ?? null),
      likeCount: likeCountByPost.get(row.id) ?? 0,
      commentCount: commentCountByPost.get(row.id) ?? 0,
      likedByViewer: likedSet.has(row.id),
      bookmarkedByViewer: bookmarkedSet.has(row.id),
    };
  });
}

export async function getMentorPosts(limit = 10): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data: mentors } = await supabase.from("profiles").select("id").eq("role", "mentor");
  const mentorIds = (mentors ?? []).map((m) => m.id);
  if (mentorIds.length === 0) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, category, content, image_url, created_at, is_anonymous, author_id")
    .in("author_id", mentorIds)
    .eq("is_anonymous", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);

  const [{ data: profiles }, { data: likeRows }, { data: commentRows }, { data: likedRows }, { data: bookmarkedRows }] =
    await Promise.all([
      supabase.from("profiles").select("id, display_name, anonymous_alias, avatar_url").in("id", mentorIds),
      supabase.from("likes").select("post_id").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
      user
        ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
      user
        ? supabase.from("bookmarks").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const likeCountByPost = new Map<string, number>();
  for (const row of likeRows ?? []) {
    likeCountByPost.set(row.post_id, (likeCountByPost.get(row.post_id) ?? 0) + 1);
  }
  const commentCountByPost = new Map<string, number>();
  for (const row of commentRows ?? []) {
    commentCountByPost.set(row.post_id, (commentCountByPost.get(row.post_id) ?? 0) + 1);
  }
  const likedSet = new Set((likedRows ?? []).map((r) => r.post_id));
  const bookmarkedSet = new Set((bookmarkedRows ?? []).map((r) => r.post_id));

  return posts.map((row) => {
    const profile = profileById.get(row.author_id);
    return {
      id: row.id,
      category: row.category,
      content: row.content,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      isAnonymous: row.is_anonymous,
      authorId: row.author_id,
      authorLabel: profile?.display_name ?? "Mentor",
      authorAvatarUrl: profile?.avatar_url ?? null,
      likeCount: likeCountByPost.get(row.id) ?? 0,
      commentCount: commentCountByPost.get(row.id) ?? 0,
      likedByViewer: likedSet.has(row.id),
      bookmarkedByViewer: bookmarkedSet.has(row.id),
    };
  });
}

export async function getPostById(postId: string): Promise<FeedPost | null> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("posts")
    .select("id, category, content, image_url, created_at, is_anonymous, author_id")
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: likeRows }, { data: commentRows }, likedResult, bookmarkedResult] =
    await Promise.all([
      supabase.from("profiles").select("display_name, anonymous_alias, avatar_url").eq("id", row.author_id).maybeSingle(),
      supabase.from("likes").select("user_id").eq("post_id", postId),
      supabase.from("comments").select("id").eq("post_id", postId),
      user
        ? supabase.from("likes").select("post_id").eq("post_id", postId).eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from("bookmarks").select("post_id").eq("post_id", postId).eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const authorLabel =
    row.is_anonymous || !profile ? (profile?.anonymous_alias ?? "Anonymous") : profile.display_name;

  return {
    id: row.id,
    category: row.category,
    content: row.content,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    isAnonymous: row.is_anonymous,
    authorId: row.author_id,
    authorLabel,
    authorAvatarUrl: row.is_anonymous ? null : (profile?.avatar_url ?? null),
    likeCount: likeRows?.length ?? 0,
    commentCount: commentRows?.length ?? 0,
    likedByViewer: Boolean(likedResult.data),
    bookmarkedByViewer: Boolean(bookmarkedResult.data),
  };
}

export async function getCommentsForPost(postId: string): Promise<FeedComment[]> {
  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, post_id, content, created_at, author_id, is_anonymous")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (comments.length === 0) return [];

  const authorIds = Array.from(new Set(comments.map((c) => c.author_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, anonymous_alias, role")
    .in("id", authorIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return comments.map((row) => {
    const profile = profileById.get(row.author_id);
    return {
      id: row.id,
      postId: row.post_id,
      content: row.content,
      createdAt: row.created_at,
      authorId: row.author_id,
      authorLabel: row.is_anonymous || !profile ? (profile?.anonymous_alias ?? "Anonymous") : profile.display_name,
      isMentor: !row.is_anonymous && profile?.role === "mentor",
    };
  });
}
