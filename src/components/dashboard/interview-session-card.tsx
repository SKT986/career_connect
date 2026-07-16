import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import type { InterviewSessionSummary } from "@/types/domain";

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-primary";
  return "text-amber-600 dark:text-amber-400";
}

const DIFFICULTY_KEYS = { easy: "difficultyEasy", medium: "difficultyMedium", hard: "difficultyHard" } as const;
const MODE_KEYS = { text: "modeText", voice: "modeVoice" } as const;

export function InterviewSessionCard({ session }: { session: InterviewSessionSummary }) {
  const t = useTranslations("mockInterview");
  const tDashboard = useTranslations("dashboard");
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex items-center gap-4 p-4">
        {session.averageScore !== null ? (
          <span className={cn("shrink-0 text-2xl font-semibold tabular-nums", scoreColor(session.averageScore))}>
            {session.averageScore}
          </span>
        ) : (
          <span className="shrink-0 text-sm text-muted-foreground">—</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="rounded-full font-normal">
              {t(DIFFICULTY_KEYS[session.difficulty])}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              {session.mode === "voice" ? <Mic className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
              {t(MODE_KEYS[session.mode])}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {tDashboard("questionsCount", { count: session.questions.length })} · {relativeTime(session.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
