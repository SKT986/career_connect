import { redirect } from "next/navigation";
import { Users, FileText, MessageSquare, ShieldCheck, UserPlus, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { ActivityLineChart } from "@/components/admin/activity-line-chart";
import { CategoryBreakdownChart } from "@/components/admin/category-breakdown-chart";
import { MentorVerificationPanel } from "@/components/admin/mentor-verification-panel";
import { StudentSearchBar } from "@/components/admin/student-search-bar";
import { PromoteStudentList } from "@/components/admin/promote-student-list";
import {
  getAdminOverview,
  getCategoryBreakdown,
  getDailyActivity,
  getPendingMentorVerifications,
  searchPromotableStudents,
} from "@/services/adminService";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/feed");

  const { q } = await searchParams;

  const [overview, dailyActivity, categoryBreakdown, pendingMentors, promotableStudents] = await Promise.all([
    getAdminOverview(),
    getDailyActivity(),
    getCategoryBreakdown(),
    getPendingMentorVerifications(),
    searchPromotableStudents(q ?? ""),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Community health, activity trends, and mentor verification — all anonymous at the app layer.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard icon={Users} label="Total users" value={overview.totalUsers} sublabel={`+${overview.newUsersLast7Days} in last 7 days`} />
        <KpiCard icon={FileText} label="Posts" value={overview.totalPosts} />
        <KpiCard icon={MessageSquare} label="Comments" value={overview.totalComments} />
        <KpiCard icon={ShieldCheck} label="Verified mentors" value={overview.verifiedMentors} />
        <KpiCard icon={UserPlus} label="Pending mentor verification" value={overview.pendingMentorVerifications} />
        <KpiCard icon={TrendingUp} label="New users (7d)" value={overview.newUsersLast7Days} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-sm font-semibold text-muted-foreground">Daily active users (14 days)</h2>
            <ActivityLineChart data={dailyActivity} series={[{ key: "activeUsers", label: "Active users", color: "var(--chart-1)" }]} />
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-sm font-semibold text-muted-foreground">Post &amp; comment volume (14 days)</h2>
            <ActivityLineChart
              data={dailyActivity}
              series={[
                { key: "posts", label: "Posts", color: "var(--chart-2)" },
                { key: "comments", label: "Comments", color: "var(--chart-3)" },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Popular topics</h2>
        <Card className="rounded-3xl">
          <CardContent className="p-5">
            {categoryBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <CategoryBreakdownChart data={categoryBreakdown} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Mentor verification queue</h2>
        <MentorVerificationPanel pending={pendingMentors} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Promote a student to mentor</h2>
        <StudentSearchBar />
        {q?.trim() && <PromoteStudentList students={promotableStudents} />}
      </section>
    </div>
  );
}
