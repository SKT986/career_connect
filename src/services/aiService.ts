import { createClient } from "@/lib/supabase/server";
import type { AiUsageStats } from "@/types/domain";

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export async function getRecentAiHistory(limit = 30): Promise<AiMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("ai_chat_history")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data
    .filter((row): row is typeof row & { role: "user" | "assistant" } => row.role !== "system")
    .reverse()
    .map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
    }));
}

export async function getAiUsageStats(userId: string): Promise<AiUsageStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_chat_history")
    .select("created_at")
    .eq("user_id", userId)
    .eq("role", "user")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    totalMessages: data.length,
    lastUsedAt: data[0]?.created_at ?? null,
  };
}

export async function saveAiMessage(params: {
  userId: string;
  role: "user" | "assistant";
  content: string;
  language: string;
}) {
  const supabase = await createClient();
  await supabase.from("ai_chat_history").insert({
    user_id: params.userId,
    role: params.role,
    content: params.content,
    function_type: null,
    language: params.language,
  });
}
