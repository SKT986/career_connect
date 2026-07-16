import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/services/notificationsService";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [notifications, t] = await Promise.all([getNotifications(user.id), getTranslations("notifications")]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <NotificationsList userId={user.id} initial={notifications} />
    </div>
  );
}
