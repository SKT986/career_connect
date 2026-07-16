import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewAnswerScore } from "@/types/domain";

export function ResultsSummary({
  questions,
  results,
  onRestart,
}: {
  questions: string[];
  results: InterviewAnswerScore[];
  onRestart: () => void;
}) {
  const t = useTranslations("mockInterview");
  const average = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Card className="rounded-3xl bg-accent/60">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("averageScore")}</p>
          <p className="text-5xl font-semibold tabular-nums">{average}</p>
          <p className="text-sm text-muted-foreground">{t("acrossQuestions", { count: results.length })}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {questions.map((question, i) => {
          const result = results[i];
          return (
            <Card key={i} className="rounded-3xl">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{question}</p>
                  <span
                    className={cn(
                      "shrink-0 text-lg font-semibold tabular-nums",
                      result.score >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : result.score >= 60
                          ? "text-primary"
                          : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {result.score}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{result.feedback}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button variant="outline" className="w-full gap-2 rounded-full" onClick={onRestart}>
        <RotateCcw className="h-4 w-4" /> {t("startAnotherInterview")}
      </Button>
    </div>
  );
}
