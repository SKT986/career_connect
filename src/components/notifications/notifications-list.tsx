"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { markAllNotificationsReadAction } from "@/services/notificationsActions";
import { NotificationItem } from "@/components/notifications/notification-item";
import type { NotificationItem as NotificationItemType } from "@/types/domain";

export function NotificationsList({ userId, initial }: { userId: string; initial: NotificationItemType[] }) {
  const t = useTranslations("notifications");
  const notifications = useRealtimeNotifications(userId, initial);
  const [isPending, startTransition] = useTransition();
  const hasUnread = notifications.some((n) => !n.readAt);

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  }

  if (notifications.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {t("caughtUp")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full"
          disabled={!hasUnread || isPending}
          onClick={handleMarkAllRead}
        >
          <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {t("markAllRead")}
        </Button>
      </div>
      <ul className="flex flex-col gap-3">
        {notifications.map((item) => (
          <li key={item.id}>
            <NotificationItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
