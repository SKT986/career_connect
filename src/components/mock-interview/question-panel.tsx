"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Mic, Square, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition, speak } from "@/hooks/use-speech-recognition";
import type { InterviewMode } from "@/types/database.types";

export function QuestionPanel({
  question,
  index,
  total,
  mode,
  isScoring,
  onSubmit,
}: {
  question: string;
  index: number;
  total: number;
  mode: InterviewMode;
  isScoring: boolean;
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const { isSupported, isListening, transcript, start, stop } = useSpeechRecognition();

  useEffect(() => {
    setAnswer("");
    if (mode === "voice") speak(question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (isListening) setAnswer(transcript);
  }, [transcript, isListening]);

  return (
    <Card className="mx-auto max-w-xl rounded-3xl">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="rounded-full font-normal">
            Question {index + 1} of {total}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => speak(question)}
            aria-label="Read question aloud"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-lg font-medium leading-relaxed">{question}</p>

        <div className="space-y-2">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            maxLength={4000}
            placeholder="Type your answer, or use STAR: Situation, Task, Action, Result..."
            aria-label="Your answer"
          />
          {mode === "voice" && isSupported && (
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              className="gap-2 rounded-full"
              onClick={() => (isListening ? stop() : start())}
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop recording" : "Record answer"}
            </Button>
          )}
        </div>

        <Button
          className={cn("w-full gap-2 rounded-full")}
          disabled={isScoring || !answer.trim()}
          onClick={() => onSubmit(answer.trim())}
        >
          {isScoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit answer
        </Button>
      </CardContent>
    </Card>
  );
}
