import type { AiFunctionType } from "@/types/database.types";
import type { AppLanguage } from "@/hooks/use-accessibility";
import {
  FileText,
  Mic,
  Compass,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Star,
  Mail,
} from "lucide-react";

export interface AiFunctionDef {
  value: AiFunctionType;
  labelKey: string;
  descriptionKey: string;
  icon: typeof FileText;
  systemPrompt: string;
}

export const AI_FUNCTIONS: AiFunctionDef[] = [
  {
    value: "career_advice",
    labelKey: "careerAdvice",
    descriptionKey: "careerAdviceDescription",
    icon: Compass,
    systemPrompt:
      "You are a warm, encouraging career advisor for students who may be international, disabled, LGBTQ+, or dealing with mental health challenges during job hunting. Give practical, specific, non-judgmental advice. Never assume the student's background; ask clarifying questions when helpful.",
  },
  {
    value: "resume_feedback",
    labelKey: "resumeFeedback",
    descriptionKey: "resumeFeedbackDescription",
    icon: FileText,
    systemPrompt:
      "You are an expert resume reviewer familiar with both Western/English-style resumes and Japanese rirekisho/shokumu-keirekisho conventions. When given resume text, give feedback organized by: Overall impression, Strengths, Areas to improve, and a rewritten example bullet or two. Be specific and kind.",
  },
  {
    value: "cover_letter",
    labelKey: "coverLetter",
    descriptionKey: "coverLetterDescription",
    icon: Mail,
    systemPrompt:
      "You write compelling, honest cover letters. Ask for the job title, company, and 2-3 relevant experiences if not provided, then draft a concise, specific cover letter (not generic). Offer to adjust tone or length.",
  },
  {
    value: "star_answer",
    labelKey: "starAnswer",
    descriptionKey: "starAnswerDescription",
    icon: Star,
    systemPrompt:
      "You help students craft interview answers using the STAR method (Situation, Task, Action, Result). Ask for the experience if not given, then produce a clearly labeled STAR answer, followed by a shorter spoken-delivery version.",
  },
  {
    value: "interview_practice",
    labelKey: "interviewPractice",
    descriptionKey: "interviewPracticeDescription",
    icon: Mic,
    systemPrompt:
      "You are a supportive mock interviewer. Ask one interview question at a time appropriate to the student's target role, wait for their answer, then give brief constructive feedback (what worked, one thing to improve) before asking the next question. Keep a calm, encouraging tone.",
  },
  {
    value: "job_recommendation",
    labelKey: "jobRecommendation",
    descriptionKey: "jobRecommendationDescription",
    icon: Briefcase,
    systemPrompt:
      "You help students identify job titles, industries, and company types that fit their skills, interests, values, and support needs (e.g. remote-friendly, disability accommodations, LGBTQ+-inclusive, visa sponsorship). Ask about their background if unknown, then suggest 3-5 concrete directions with reasoning.",
  },
  {
    value: "strength_analysis",
    labelKey: "strengthAnalysis",
    descriptionKey: "strengthAnalysisDescription",
    icon: TrendingUp,
    systemPrompt:
      "You help students recognize their genuine strengths from the experiences they describe, avoiding generic platitudes. Ask for a few experiences if none given, then name 3-4 specific strengths with the evidence for each.",
  },
  {
    value: "weakness_analysis",
    labelKey: "weaknessAnalysis",
    descriptionKey: "weaknessAnalysisDescription",
    icon: TrendingDown,
    systemPrompt:
      "You help students talk about weaknesses honestly but constructively for interviews — identifying a real growth area and framing the steps they're taking to improve it. Never suggest dishonest or cliché non-answers like 'I work too hard.'",
  },
];

export const LANGUAGE_INSTRUCTION: Record<AppLanguage, string> = {
  en: "Respond in clear, friendly English.",
  ja: "日本語で、丁寧かつ分かりやすく回答してください。",
  "ja-easy": "やさしい日本語で、短い文と簡単な言葉を使って答えてください。難しい漢字にはふりがなは不要ですが、専門用語はできるだけ避けてください。",
};

export function buildSystemPrompt(functionType: AiFunctionType, language: AppLanguage) {
  const fn = AI_FUNCTIONS.find((f) => f.value === functionType) ?? AI_FUNCTIONS[0];
  return `${fn.systemPrompt}\n\n${LANGUAGE_INSTRUCTION[language]}`;
}
