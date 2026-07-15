import { generateObject } from "ai";
import { z } from "zod";
import { getChatModel } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";
import type { InterviewDifficulty, InterviewMode } from "@/types/database.types";
import type { InterviewAnswerScore, InterviewSessionSummary } from "@/types/domain";

const QUESTION_COUNT = 5;

const questionsSchema = z.object({
  questions: z.array(z.string()).length(QUESTION_COUNT),
});

const scoreSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  strengths: z.array(z.string()).max(4),
  improvements: z.array(z.string()).max(4),
});

const DIFFICULTY_GUIDANCE: Record<InterviewDifficulty, string> = {
  easy: "Ask warm-up, broadly applicable behavioral questions (e.g. 'Tell me about yourself', 'Why this field?'). Keep them approachable for someone early in their job search or nervous about interviewing.",
  medium: "Ask standard behavioral and situational interview questions a hiring manager would realistically ask, including at least one about handling conflict or failure.",
  hard: "Ask challenging behavioral and competency questions, including at least one multi-part or pressure-testing question (e.g. handling ambiguity, a time they disagreed with leadership, or a high-stakes tradeoff).",
};

export async function generateInterviewQuestions(difficulty: InterviewDifficulty): Promise<string[]> {
  const { object } = await generateObject({
    model: getChatModel(),
    schema: questionsSchema,
    schemaName: "interview_questions",
    system:
      "You generate mock job interview questions for a diverse group of students — including international students, students with disabilities, LGBTQ+ students, and students managing mental health concerns during their job search. Questions must be general career/behavioral interview questions (not role- or industry-specific), inclusive, and never presumptive about the candidate's background.",
    prompt: `Generate exactly ${QUESTION_COUNT} mock interview questions at ${difficulty} difficulty. ${DIFFICULTY_GUIDANCE[difficulty]}`,
  });

  return object.questions;
}

export async function scoreInterviewAnswer(params: {
  question: string;
  answer: string;
  difficulty: InterviewDifficulty;
}): Promise<InterviewAnswerScore> {
  const { object } = await generateObject({
    model: getChatModel(),
    schema: scoreSchema,
    schemaName: "interview_answer_score",
    system:
      "You are a supportive, encouraging interview coach scoring a practice answer. Be honest but kind — this student may be anxious about interviewing. Score holistically on clarity, structure (e.g. STAR), and relevance, calibrated to the stated difficulty level. Give specific, actionable improvements, not generic advice.",
    prompt: `Difficulty: ${params.difficulty}\nQuestion: ${params.question}\nCandidate's answer: ${params.answer || "(no answer given)"}\n\nScore this answer from 0-100 and give feedback.`,
  });

  return object;
}

export async function createInterviewSession(params: {
  userId: string;
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  questions: string[];
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      student_id: params.userId,
      mode: params.mode,
      difficulty: params.difficulty,
      questions: params.questions,
      scores: {},
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveInterviewAnswerScore(params: {
  sessionId: string;
  userId: string;
  questionIndex: number;
  question: string;
  answer: string;
  result: InterviewAnswerScore;
}): Promise<void> {
  const supabase = await createClient();
  const { data: session, error: fetchError } = await supabase
    .from("interview_sessions")
    .select("scores")
    .eq("id", params.sessionId)
    .eq("student_id", params.userId)
    .single();

  if (fetchError) throw fetchError;

  const scores = (session.scores ?? {}) as Record<string, unknown>;
  scores[String(params.questionIndex)] = {
    question: params.question,
    answer: params.answer,
    ...params.result,
  };

  const { error: updateError } = await supabase
    .from("interview_sessions")
    .update({ scores })
    .eq("id", params.sessionId)
    .eq("student_id", params.userId);

  if (updateError) throw updateError;
}

export async function getInterviewHistory(userId: string): Promise<InterviewSessionSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("id, mode, difficulty, questions, scores, created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  return data.map((row) => {
    const scores = Object.values((row.scores ?? {}) as Record<string, { score?: number }>);
    const validScores = scores.map((s) => s.score).filter((s): s is number => typeof s === "number");
    const averageScore =
      validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;

    return {
      id: row.id,
      mode: row.mode,
      difficulty: row.difficulty,
      questions: row.questions as string[],
      createdAt: row.created_at,
      averageScore,
    };
  });
}
