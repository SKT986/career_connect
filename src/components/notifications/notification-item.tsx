"use client";

import { useTransition } from "react";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Mic, Briefcase, Info, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import { markNotificationReadAction } from "@/services/notificationsActions";
import type { NotificationItem as NotificationItemType } from "@/types/domain";
import type { NotificationType } from "@/types/database.types";

const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; label: string }> = {
  reply: { icon: MessageCircle, label: "New reply" },
  mentor_comment: { icon: ShieldCheck, label: "Mentor replied" },
  interview_completed: { icon: Mic, label: "Interview completed" },
  company_invitation: { icon: Briefcase, label: "Company invitation" },
  system: { icon: Info, label: "Notice" },
};

function stringField(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" ? value : null;
}

export function NotificationItem({ item }: { item: NotificationItemType }) {
  const [isPending, startTransition] = useTransition();
  const meta = NOTIFICATION_META[item.type];
  const excerpt = stringField(item.payload, "excerpt");
  const postId = stringField(item.payload, "postId");
  const companyName = stringField(item.payload, "companyName");
  const authorLabel = stringField(item.payload, "authorLabel") ?? companyName;
  const targetHref = postId ? `/feed/${postId}` : item.type === "company_invitation" ? "/companies" : null;
  const isUnread = !item.readAt;

  function handleOpen() {
    if (!isUnread) return;
    startTransition(async () => {
      await markNotificationReadAction(item.id);
    });
  }

  const body = (
    <CardContent className="flex items-start gap-3 p-4">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
          isUnread ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
      >
        <meta.icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {meta.label}
          {authorLabel && <span className="font-normal text-muted-foreground"> · {authorLabel}</span>}
        </p>
        {excerpt && <p className="mt-0.5 truncate text-sm text-muted-foreground">{excerpt}</p>}
        <p className="mt-1 text-xs text-muted-foreground/80">{relativeTime(item.createdAt)}</p>
      </div>
      {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
    </CardContent>
  );

  return (
    <Card className={cn("rounded-3xl transition-opacity", isPending && "opacity-70")}>
      {targetHref ? (
        <Link
          href={targetHref}
          onClick={handleOpen}
          className="block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {body}
        </Link>
      ) : (
        <button type="button" onClick={handleOpen} className="block w-full text-left">
          {body}
        </button>
      )}
    </Card>
  );
}
