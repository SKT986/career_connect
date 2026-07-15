import { createClient } from "@/lib/supabase/server";
import type { ResumeVersionSummary } from "@/types/domain";

export async function getResumeVersions(userId: string): Promise<ResumeVersionSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resume_versions")
    .select("id, title, language, created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    language: row.language,
    createdAt: row.created_at,
  }));
}
