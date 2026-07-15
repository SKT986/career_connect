"use client";

import { useState } from "react";
import { SetupPanel } from "@/components/mock-interview/setup-panel";
import { QuestionPanel } from "@/components/mock-interview/question-panel";
import { ScoreCard } from "@/components/mock-interview/score-card";
import { ResultsSummary } from "@/components/mock-interview/results-summary";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import type { InterviewDifficulty, InterviewMode } from "@/types/database.types";
import type { InterviewAnswerScore } from "@/types/domain";

type Phase = "setup" | "question" | "scoring" | "answered" | "finished";

export function MockInterviewFlow() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("medium");
  const [mode, setMode] = useState<InterviewMode>("text");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<InterviewAnswerScore[]>([]);
  const [currentResult, setCurrentResult] = useState<InterviewAnswerScore | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSupported: speechSupported } = useSpeechRecognition();

  async function handleStart(nextDifficulty: InterviewDifficulty, nextMode: InterviewMode) {
    setIsStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/mock-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: nextDifficulty, mode: nextMode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");

      setDifficulty(nextDifficulty);
      setMode(nextMode);
      setSessionId(json.sessionId);
      setQuestions(json.questions);
      setCurrentIndex(0);
      setResults([]);
      setCurrentResult(null);
      setPhase("question");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleSubmitAnswer(answer: string) {
    if (!sessionId) return;
    setPhase("scoring");
    setError(null);
    try {
      const res = await fetch("/api/mock-interview/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionIndex: currentIndex,
          question: questions[currentIndex],
          answer,
          difficulty,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");

      setCurrentResult(json);
      setResults((prev) => {
        const next = [...prev];
        next[currentIndex] = json;
        return next;
      });
      setPhase("answered");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("question");
    }
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setCurrentResult(null);
      setPhase("question");
    } else {
      setPhase("finished");
    }
  }

  function handleRestart() {
    setPhase("setup");
    setSessionId(null);
    setQuestions([]);
    setResults([]);
    setCurrentResult(null);
    setCurrentIndex(0);
  }

  if (phase === "setup") {
    return (
      <SetupPanel onStart={handleStart} isStarting={isStarting} error={error} speechSupported={speechSupported} />
    );
  }

  if (phase === "finished") {
    return <ResultsSummary questions={questions} results={results} onRestart={handleRestart} />;
  }

  if (phase === "answered" && currentResult) {
    return (
      <ScoreCard result={currentResult} isLastQuestion={currentIndex + 1 >= questions.length} onNext={handleNext} />
    );
  }

  return (
    <div className="space-y-3">
      <QuestionPanel
        question={questions[currentIndex]}
        index={currentIndex}
        total={questions.length}
        mode={mode}
        isScoring={phase === "scoring"}
        onSubmit={handleSubmitAnswer}
      />
      {error && <p role="alert" className="mx-auto max-w-xl text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
