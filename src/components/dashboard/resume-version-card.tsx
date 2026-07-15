import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { relativeTime } from "@/lib/format";
import type { ResumeVersionSummary } from "@/types/domain";

export function ResumeVersionCard({ resume }: { resume: ResumeVersionSummary }) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{resume.title}</p>
          <p className="text-xs text-muted-foreground">Saved {relativeTime(resume.createdAt)}</p>
        </div>
        <Badge variant="secondary" className="rounded-full font-normal uppercase">
          {resume.language}
        </Badge>
      </CardContent>
    </Card>
  );
}
