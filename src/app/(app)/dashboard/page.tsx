import { redirect } from "next/navigation";
import { Bookmark, Mic, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/shared/kpi-card";
import { PostCard } from "@/components/feed/post-card";
import { InterviewSessionCard } from "@/components/dashboard/interview-session-card";
import { ResumeVersionCard } from "@/components/dashboard/resume-version-card";
import { AiUsagePanel } from "@/components/dashboard/ai-usage-panel";
import { getBookmarkedPosts } from "@/services/postsService";
import { getInterviewHistory } from "@/services/interviewService";
import { getResumeVersions } from "@/services/resumeService";
import { getAiUsageStats } from "@/services/aiService";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [savedPosts, interviewHistory, resumeVersions, aiUsage] = await Promise.all([
    getBookmarkedPosts(user.id),
    getInterviewHistory(user.id),
    getResumeVersions(user.id),
    getAiUsageStats(user.id),
  ]);

  const scoredSessions = interviewHistory.filter((s) => s.averageScore !== null);
  const averageInterviewScore =
    scoredSessions.length > 0
      ? Math.round(scoredSessions.reduce((sum, s) => sum + (s.averageScore ?? 0), 0) / scoredSessions.length)
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Saved posts, interview practice, resume versions, and AI Assistant usage in one place.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Bookmark} label="Saved posts" value={savedPosts.length} />
        <KpiCard
          icon={Mic}
          label="Mock interviews"
          value={interviewHistory.length}
          sublabel={averageInterviewScore !== null ? `Avg score ${averageInterviewScore}` : undefined}
        />
        <KpiCard icon={FileText} label="Resume versions" value={resumeVersions.length} />
        <KpiCard icon={Sparkles} label="AI messages" value={aiUsage.totalMessages} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Saved posts</h2>
        {savedPosts.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Bookmark a post from the community feed to save it here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {savedPosts.map((post) => (
              <PostCard key={post.id} post={post} href={`/feed/${post.id}`} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Interview practice history</h2>
        {interviewHistory.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Run a mock interview to start building your history.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {interviewHistory.map((session) => (
              <InterviewSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Resume versions</h2>
        {resumeVersions.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Saved resume versions will appear here once resume tracking is available.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {resumeVersions.map((resume) => (
              <ResumeVersionCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">AI Assistant usage</h2>
        <AiUsagePanel usage={aiUsage} />
      </section>
    </div>
  );
}
