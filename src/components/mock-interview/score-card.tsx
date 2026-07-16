import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, TrendingUp, ArrowRight, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewAnswerScore } from "@/types/domain";

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-primary";
  return "text-amber-600 dark:text-amber-400";
}

export function ScoreCard({
  result,
  isLastQuestion,
  onNext,
}: {
  result: InterviewAnswerScore;
  isLastQuestion: boolean;
  onNext: () => void;
}) {
  const t = useTranslations("mockInterview");
  return (
    <Card className="mx-auto max-w-xl rounded-3xl">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center gap-4">
          <span className={cn("text-4xl font-semibold tabular-nums", scoreColor(result.score))}>{result.score}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-primary" : "bg-amber-500"
              )}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">{result.feedback}</p>

        {result.strengths.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" /> {t("strengths")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.strengths.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {result.improvements.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> {t("toImprove")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.improvements.map((s) => (
                <Badge key={s} className="rounded-full font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button className="w-full gap-2 rounded-full" onClick={onNext}>
          {isLastQuestion ? (
            <>
              <PartyPopper className="h-4 w-4" /> {t("seeResults")}
            </>
          ) : (
            <>
              {t("nextQuestion")} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
