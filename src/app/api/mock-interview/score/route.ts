import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { scoreInterviewAnswer, saveInterviewAnswerScore } from "@/services/interviewService";
import type { InterviewDifficulty } from "@/types/database.types";

const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ANSWER_LENGTH = 4000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(`mock-interview-score:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "You've hit the scoring limit for now. Please try again in a bit." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const sessionId = String(body.sessionId ?? "");
  const questionIndex = Number(body.questionIndex);
  const question = String(body.question ?? "").trim();
  const answer = String(body.answer ?? "").trim();
  const difficulty = body.difficulty as InterviewDifficulty;

  if (!sessionId || !question || Number.isNaN(questionIndex)) {
    return NextResponse.json({ error: "Missing question context." }, { status: 400 });
  }
  if (answer.length > MAX_ANSWER_LENGTH) {
    return NextResponse.json({ error: `Answers must be under ${MAX_ANSWER_LENGTH} characters.` }, { status: 400 });
  }

  try {
    const result = await scoreInterviewAnswer({ question, answer, difficulty });
    await saveInterviewAnswerScore({ sessionId, userId: user.id, questionIndex, question, answer, result });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Couldn't score that answer right now. Please try again in a moment." },
      { status: 502 }
    );
  }
}
