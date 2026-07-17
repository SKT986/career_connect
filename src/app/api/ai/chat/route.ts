import { streamText, type ModelMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getChatModel } from "@/lib/anthropic";
import { buildSystemPrompt } from "@/lib/ai-functions";
import { isRateLimited } from "@/lib/rate-limit";
import { saveAiMessage } from "@/services/aiService";
import type { AppLanguage } from "@/hooks/use-accessibility";

export const maxDuration = 60;

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (isRateLimited(`ai-chat:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return new Response("You've hit the AI usage limit for now. Please try again in a few minutes.", {
      status: 429,
    });
  }

  const body = await request.json();
  const messages = body.messages as { role: "user" | "assistant"; content: string }[];
  const language = (body.language as AppLanguage) ?? "en";

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    await saveAiMessage({
      userId: user.id,
      role: "user",
      content: lastUserMessage.content,
      language,
    });
  }

  const modelMessages: ModelMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));

  const result = streamText({
    model: getChatModel(),
    system: buildSystemPrompt(language),
    messages: modelMessages,
    onFinish: async ({ text }) => {
      await saveAiMessage({
        userId: user.id,
        role: "assistant",
        content: text,
        language,
      });
    },
  });

  return result.toTextStreamResponse();
}
