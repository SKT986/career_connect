"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types/database.types";
import type { NotificationItem } from "@/types/domain";

function toNotificationItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    payload: row.payload,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export function useRealtimeNotifications(userId: string, initial: NotificationItem[]) {
  const [notifications, setNotifications] = useState(initial);

  useEffect(() => {
    setNotifications(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as NotificationRow;
          setNotifications((prev) => [toNotificationItem(row), ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as NotificationRow;
          setNotifications((prev) => prev.map((n) => (n.id === row.id ? toNotificationItem(row) : n)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return notifications;
}
