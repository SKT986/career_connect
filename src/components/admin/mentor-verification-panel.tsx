"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/format";
import { verifyMentorAction } from "@/services/adminActions";
import type { PendingMentorProfile } from "@/types/domain";

export function MentorVerificationPanel({ pending }: { pending: PendingMentorProfile[] }) {
  const t = useTranslations("admin");
  const [isPending, startTransition] = useTransition();

  function handleVerify(profileId: string, displayName: string) {
    startTransition(async () => {
      const result = await verifyMentorAction(profileId);
      if (result.error) toast.error(result.error);
      else toast.success(t("nowVerifiedMentor", { name: displayName }));
    });
  }

  if (pending.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        {t("noMentorsWaiting")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {pending.map((mentor) => (
        <li key={mentor.profileId}>
          <Card className="rounded-3xl">
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {mentor.displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{mentor.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {mentor.universityEmail ?? t("noEmailOnFile")} · {t("requested", { time: relativeTime(mentor.createdAt) })}
                </p>
                {mentor.headline && (
                  <p className="mt-1 truncate text-xs text-muted-foreground/80">{mentor.headline}</p>
                )}
              </div>
              <Button
                size="sm"
                className="gap-1.5 rounded-full"
                disabled={isPending}
                onClick={() => handleVerify(mentor.profileId, mentor.displayName)}
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("verify")}
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
