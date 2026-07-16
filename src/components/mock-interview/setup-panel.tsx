"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Keyboard, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewDifficulty, InterviewMode } from "@/types/database.types";

const DIFFICULTIES: { value: InterviewDifficulty; labelKey: string; descriptionKey: string }[] = [
  { value: "easy", labelKey: "difficultyEasy", descriptionKey: "difficultyEasyDescription" },
  { value: "medium", labelKey: "difficultyMedium", descriptionKey: "difficultyMediumDescription" },
  { value: "hard", labelKey: "difficultyHard", descriptionKey: "difficultyHardDescription" },
];

export function SetupPanel({
  onStart,
  isStarting,
  error,
  speechSupported,
}: {
  onStart: (difficulty: InterviewDifficulty, mode: InterviewMode) => void;
  isStarting: boolean;
  error: string | null;
  speechSupported: boolean;
}) {
  const t = useTranslations("mockInterview");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("medium");
  const [mode, setMode] = useState<InterviewMode>("text");

  return (
    <Card className="mx-auto max-w-xl rounded-3xl">
      <CardHeader>
        <CardTitle>{t("startInterview")}</CardTitle>
        <CardDescription>{t("startInterviewDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("difficulty")}</p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                aria-pressed={difficulty === d.value}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-colors",
                  difficulty === d.value ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/60"
                )}
              >
                <p className="text-sm font-medium">{t(d.labelKey)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(d.descriptionKey)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("mode")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("text")}
              aria-pressed={mode === "text"}
              className={cn(
                "flex items-center gap-2 rounded-2xl border p-3 transition-colors",
                mode === "text" ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/60"
              )}
            >
              <Keyboard className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">{t("modeText")}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("voice")}
              aria-pressed={mode === "voice"}
              className={cn(
                "flex items-center gap-2 rounded-2xl border p-3 transition-colors",
                mode === "voice" ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/60"
              )}
            >
              <Mic className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">{t("modeVoice")}</span>
            </button>
          </div>
          {mode === "voice" && !speechSupported && (
            <p className="text-xs text-muted-foreground">{t("voiceNotSupported")}</p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button className="w-full rounded-full" onClick={() => onStart(difficulty, mode)} disabled={isStarting}>
          {isStarting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("startInterviewButton")}
        </Button>
      </CardContent>
    </Card>
  );
}
