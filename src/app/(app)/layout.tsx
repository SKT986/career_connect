import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { getUnreadNotificationCount } from "@/services/notificationsService";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, unreadCount, t] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url, role").eq("id", user.id).single(),
    getUnreadNotificationCount(user.id),
    getTranslations("common"),
  ]);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav role={profile?.role ?? "student"} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userId={user.id}
          displayName={profile?.display_name ?? t("you")}
          avatarUrl={profile?.avatar_url ?? null}
          role={profile?.role ?? "student"}
          initialUnreadCount={unreadCount}
        />
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
