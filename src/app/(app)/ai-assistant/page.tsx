import { getTranslations } from "next-intl/server";
import { getRecentAiHistory } from "@/services/aiService";
import { ChatWindow } from "@/components/ai/chat-window";

export default async function AiAssistantPage() {
  const [history, t] = await Promise.all([getRecentAiHistory(), getTranslations("aiAssistant")]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("pageSubtitle")}</p>
      </div>
      <ChatWindow initialMessages={history} />
    </div>
  );
}
