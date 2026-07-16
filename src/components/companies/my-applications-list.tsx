"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/format";
import { respondToRevealAction } from "@/services/companiesActions";
import type { ApplicationSummary, MatchingRequestSummary } from "@/types/domain";
import type { ApplicationStatus } from "@/types/database.types";

const STATUS_KEYS: Record<ApplicationStatus, string> = {
  submitted: "statusSubmitted",
  reviewing: "statusReviewing",
  interview: "statusInterview",
  offer: "statusOffer",
  rejected: "statusRejected",
  withdrawn: "statusWithdrawn",
};

function RevealRequestCard({ request }: { request: MatchingRequestSummary }) {
  const t = useTranslations("companies");
  const [isPending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      const result = await respondToRevealAction(request.companyId, accept);
      if (result.error) toast.error(result.error);
      else toast.success(accept ? t("identityShared", { company: request.companyName }) : t("requestDeclined"));
    });
  }

  return (
    <Card className="rounded-3xl border-primary/30 bg-accent/40">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-medium">{t("wantsToSeeWhoYouAre", { company: request.companyName })}</p>
          <p className="text-xs text-muted-foreground">{t("requested", { time: relativeTime(request.createdAt) })}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 rounded-full" disabled={isPending} onClick={() => respond(false)}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {t("decline")}
          </Button>
          <Button size="sm" className="gap-1.5 rounded-full" disabled={isPending} onClick={() => respond(true)}>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {t("accept")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyApplicationsList({
  applications,
  matchingRequests,
}: {
  applications: ApplicationSummary[];
  matchingRequests: MatchingRequestSummary[];
}) {
  const t = useTranslations("companies");
  const pendingRequests = matchingRequests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <RevealRequestCard key={request.companyId} request={request} />
          ))}
        </div>
      )}

      {applications.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          {t("applicationsEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {applications.map((app) => (
            <li key={app.id}>
              <Card className="rounded-2xl">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{app.jobTitle}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t("appliedAt", { company: app.companyName, time: relativeTime(app.createdAt) })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 rounded-full font-normal">
                    {t(STATUS_KEYS[app.status])}
                  </Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
