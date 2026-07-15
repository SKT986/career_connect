"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PostCategory } from "@/types/database.types";

export interface PostActionState {
  error?: string;
  success?: boolean;
}

const MAX_POST_LENGTH = 4000;
const MAX_COMMENT_LENGTH = 1000;

export async function createPostAction(
  _prev: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to post." };

  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "other") as PostCategory;
  const isAnonymous = formData.get("isAnonymous") !== "false";
  const imageUrl = String(formData.get("imageUrl") ?? "") || null;

  if (!content) return { error: "Write something before posting." };
  if (content.length > MAX_POST_LENGTH) {
    return { error: `Posts must be under ${MAX_POST_LENGTH} characters.` };
  }

  const { error } = await supabase.from("posts").insert({
    author_id: user.id,
    content,
    category,
    is_anonymous: isAnonymous,
    image_url: imageUrl,
  });

  if (error) return { error: "Something went wrong posting. Please try again." };

  revalidatePath("/feed");
  return { success: true };
}

export async function createCommentAction(
  postId: string,
  _prev: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to comment." };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Comment can't be empty." };
  if (content.length > MAX_COMMENT_LENGTH) {
    return { error: `Comments must be under ${MAX_COMMENT_LENGTH} characters.` };
  }
  const isAnonymous = formData.get("isAnonymous") !== "false";

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content,
    is_anonymous: isAnonymous,
  });

  if (error) return { error: "Something went wrong commenting. Please try again." };

  revalidatePath(`/feed/${postId}`);
  revalidatePath("/feed");
  return { success: true };
}

export async function toggleLikeAction(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/feed");
  revalidatePath(`/feed/${postId}`);
  return { success: true };
}

export async function toggleBookmarkAction(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await supabase.from("bookmarks").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/feed");
  revalidatePath(`/feed/${postId}`);
  return { success: true };
}
