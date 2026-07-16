import { redirect } from "next/navigation";
import { Users, FileText, MessageSquare, ShieldCheck, UserPlus, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { ActivityLineChart } from "@/components/admin/activity-line-chart";
import { CategoryBreakdownChart } from "@/components/admin/category-breakdown-chart";
import { MentorVerificationPanel } from "@/components/admin/mentor-verification-panel";
import { StudentSearchBar } from "@/components/admin/student-search-bar";
import { PromoteStudentList } from "@/components/admin/promote-student-list";
import { CreateCompanyForm } from "@/components/admin/create-company-form";
import { formatDate } from "@/lib/format";
import {
  getAdminOverview,
  getAllCompanies,
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

  const [overview, dailyActivity, categoryBreakdown, pendingMentors, promotableStudents, companies, t] =
    await Promise.all([
      getAdminOverview(),
      getDailyActivity(),
      getCategoryBreakdown(),
      getPendingMentorVerifications(),
      searchPromotableStudents(q ?? ""),
      getAllCompanies(),
      getTranslations("admin"),
    ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard icon={Users} label={t("totalUsers")} value={overview.totalUsers} sublabel={t("newUsersLast7Days", { count: overview.newUsersLast7Days })} />
        <KpiCard icon={FileText} label={t("posts")} value={overview.totalPosts} />
        <KpiCard icon={MessageSquare} label={t("comments")} value={overview.totalComments} />
        <KpiCard icon={ShieldCheck} label={t("verifiedMentors")} value={overview.verifiedMentors} />
        <KpiCard icon={UserPlus} label={t("pendingMentorVerification")} value={overview.pendingMentorVerifications} />
        <KpiCard icon={TrendingUp} label={t("newUsers7d")} value={overview.newUsersLast7Days} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-sm font-semibold text-muted-foreground">{t("dailyActiveUsers")}</h2>
            <ActivityLineChart data={dailyActivity} series={[{ key: "activeUsers", label: t("activeUsers"), color: "var(--chart-1)" }]} />
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-sm font-semibold text-muted-foreground">{t("postCommentVolume")}</h2>
            <ActivityLineChart
              data={dailyActivity}
              series={[
                { key: "posts", label: t("posts"), color: "var(--chart-2)" },
                { key: "comments", label: t("comments"), color: "var(--chart-3)" },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("popularTopics")}</h2>
        <Card className="rounded-3xl">
          <CardContent className="p-5">
            {categoryBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("noPostsYet")}</p>
            ) : (
              <CategoryBreakdownChart data={categoryBreakdown} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("mentorVerificationQueue")}</h2>
        <MentorVerificationPanel pending={pendingMentors} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("promoteStudent")}</h2>
        <StudentSearchBar />
        {q?.trim() && <PromoteStudentList students={promotableStudents} />}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("companies")}</h2>
        <CreateCompanyForm />
        {companies.length > 0 && (
          <ul className="flex flex-col gap-2">
            {companies.map((c) => (
              <li key={c.id}>
                <Card className="rounded-2xl">
                  <CardContent className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      {c.website && <p className="truncate text-xs text-muted-foreground">{c.website}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{t("joined", { date: formatDate(c.createdAt) })}</span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
