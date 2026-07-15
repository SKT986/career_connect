import { getRecentAiHistory } from "@/services/aiService";
import { ChatWindow } from "@/components/ai/chat-window";

export default async function AiAssistantPage() {
  const history = await getRecentAiHistory();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">AI Career Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Resume feedback, interview practice, and career advice — in English or Japanese, any time.
        </p>
      </div>
      <ChatWindow initialMessages={history} />
    </div>
  );
}
