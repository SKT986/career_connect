"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Mic, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/ai/message-bubble";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useSpeechRecognition, speechLangFor } from "@/hooks/use-speech-recognition";
import type { AiMessage } from "@/services/aiService";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWindow({ initialMessages }: { initialMessages: AiMessage[] }) {
  const t = useTranslations("aiAssistant");
  const { language } = useAccessibility();
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content }))
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isSupported: speechSupported, isListening, transcript, start, stop } = useSpeechRecognition();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (isListening) setInput(transcript);
  }, [transcript, isListening]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    if (isListening) stop();
    setError(null);
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantId = crypto.randomUUID();
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          language,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || t("unavailableError"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
        );
      }

      // The AI SDK's plain-text stream can't change the HTTP status once
      // streaming has started, so a mid-stream provider failure (e.g. an
      // Anthropic quota/credit error) surfaces here as a stream that ends
      // with no content rather than a non-200 response.
      if (!fullText.trim()) {
        throw new Error(t("noResponseError"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-border bg-card">
        <ScrollArea className="flex-1 px-5 py-4">
          <div aria-live="polite" className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                {t("privacyNote")}
              </div>
            )}
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                isStreaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {error && (
          <p role="alert" className="px-5 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={t("typeMessagePlaceholder")}
            aria-label={t("messageAiAssistant")}
            rows={1}
            className="max-h-40 min-h-10 flex-1 resize-none rounded-2xl"
          />
          {speechSupported && (
            <Button
              type="button"
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              className="shrink-0 rounded-full"
              disabled={isStreaming}
              onClick={() => (isListening ? stop() : start(speechLangFor(language)))}
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">{isListening ? t("stopVoiceInput") : t("startVoiceInput")}</span>
            </Button>
          )}
          <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={isStreaming || !input.trim()}>
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">{t("send")}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
