"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Keyboard, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewDifficulty, InterviewMode } from "@/types/database.types";

const DIFFICULTIES: { value: InterviewDifficulty; label: string; description: string }[] = [
  { value: "easy", label: "Easy", description: "Warm-up, broadly applicable questions" },
  { value: "medium", label: "Medium", description: "Standard behavioral & situational" },
  { value: "hard", label: "Hard", description: "Challenging, multi-part questions" },
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
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("medium");
  const [mode, setMode] = useState<InterviewMode>("text");

  return (
    <Card className="mx-auto max-w-xl rounded-3xl">
      <CardHeader>
        <CardTitle>Start a mock interview</CardTitle>
        <CardDescription>
          5 questions, scored instantly with specific feedback. Nothing here is shared with anyone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Difficulty</p>
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
                <p className="text-sm font-medium">{d.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Mode</p>
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
              <span className="text-sm font-medium">Text</span>
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
              <span className="text-sm font-medium">Voice</span>
            </button>
          </div>
          {mode === "voice" && !speechSupported && (
            <p className="text-xs text-muted-foreground">
              Voice input isn&apos;t supported in this browser — questions will still be read aloud, and you can type
              your answers.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button className="w-full rounded-full" onClick={() => onStart(difficulty, mode)} disabled={isStarting}>
          {isStarting && <Loader2 className="h-4 w-4 animate-spin" />}
          Start interview
        </Button>
      </CardContent>
    </Card>
  );
}
