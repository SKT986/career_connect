import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { generateInterviewQuestions, createInterviewSession } from "@/services/interviewService";
import type { InterviewDifficulty, InterviewMode } from "@/types/database.types";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DIFFICULTIES: InterviewDifficulty[] = ["easy", "medium", "hard"];
const MODES: InterviewMode[] = ["text", "voice"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(`mock-interview-start:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "You've started a lot of mock interviews recently. Please try again in a bit." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const difficulty = body.difficulty as InterviewDifficulty;
  const mode = body.mode as InterviewMode;

  if (!DIFFICULTIES.includes(difficulty) || !MODES.includes(mode)) {
    return NextResponse.json({ error: "Invalid difficulty or mode." }, { status: 400 });
  }

  try {
    const questions = await generateInterviewQuestions(difficulty);
    const sessionId = await createInterviewSession({ userId: user.id, mode, difficulty, questions });
    return NextResponse.json({ sessionId, questions });
  } catch {
    return NextResponse.json(
      { error: "Couldn't generate interview questions right now. Please try again in a moment." },
      { status: 502 }
    );
  }
}
