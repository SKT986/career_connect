"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/format";
import { applyToJobAction } from "@/services/companiesActions";
import type { JobListing } from "@/types/domain";

export function JobCard({ job }: { job: JobListing }) {
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    startTransition(async () => {
      const result = await applyToJobAction(job.id);
      if (result.error) toast.error(result.error);
      else toast.success(`Applied to ${job.title} at ${job.companyName}.`);
    });
  }

  return (
    <Card className="rounded-3xl">
      <CardContent className="flex flex-col gap-3 p-5">
        <div>
          <p className="text-sm font-medium">{job.title}</p>
          <p className="text-xs text-muted-foreground">{job.companyName}</p>
        </div>
        {(job.location || job.description) && (
          <div className="space-y-1.5">
            {job.location && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {job.location}
              </p>
            )}
            {job.description && <p className="line-clamp-3 text-sm text-foreground/90">{job.description}</p>}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground/80">{relativeTime(job.createdAt)}</span>
          {job.alreadyApplied ? (
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Applied
            </span>
          ) : (
            <Button size="sm" className="rounded-full" disabled={isPending} onClick={handleApply}>
              Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
