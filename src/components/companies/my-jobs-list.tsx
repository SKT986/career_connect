"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/format";
import { requestRevealAction } from "@/services/companiesActions";
import type { ApplicantSummary, JobWithApplicants } from "@/types/domain";

function RevealAction({ applicant }: { applicant: ApplicantSummary }) {
  const t = useTranslations("companies");
  const [isPending, startTransition] = useTransition();

  function handleRequest() {
    startTransition(async () => {
      const result = await requestRevealAction(applicant.studentId);
      if (result.error) toast.error(result.error);
      else toast.success(t("revealRequestSent"));
    });
  }

  if (applicant.identityRevealed) {
    return (
      <Badge variant="secondary" className="rounded-full font-normal">
        {t("identityRevealed")}
      </Badge>
    );
  }
  if (applicant.revealStatus === "pending") {
    return (
      <Badge variant="secondary" className="rounded-full font-normal">
        {t("revealRequested")}
      </Badge>
    );
  }
  if (applicant.revealStatus === "declined") {
    return (
      <Badge variant="secondary" className="rounded-full font-normal text-muted-foreground">
        {t("declined")}
      </Badge>
    );
  }

  return (
    <Button size="sm" variant="outline" className="gap-1.5 rounded-full" disabled={isPending} onClick={handleRequest}>
      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      {t("requestReveal")}
    </Button>
  );
}

export function MyJobsList({ jobs }: { jobs: JobWithApplicants[] }) {
  const t = useTranslations("companies");
  if (jobs.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {t("postFirstRole")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {jobs.map((job) => (
        <li key={job.id}>
          <Card className="rounded-3xl">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-sm font-medium">{job.title}</p>
                <p className="text-xs text-muted-foreground">
                  {job.location ? `${job.location} · ` : ""}
                  {t("posted", { time: relativeTime(job.createdAt) })}
                </p>
              </div>

              {job.applicants.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noApplicantsYet")}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {job.applicants.map((applicant) => (
                    <li
                      key={applicant.applicationId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{applicant.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("appliedTime", { time: relativeTime(applicant.appliedAt) })}
                        </p>
                      </div>
                      <RevealAction applicant={applicant} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
