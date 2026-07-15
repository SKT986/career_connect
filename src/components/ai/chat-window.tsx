"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/ai/message-bubble";
import { FunctionPicker } from "@/components/ai/function-picker";
import { AI_FUNCTIONS } from "@/lib/ai-functions";
import { useAccessibility } from "@/hooks/use-accessibility";
import type { AiFunctionType } from "@/types/database.types";
import type { AiMessage } from "@/services/aiService";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWindow({ initialMessages }: { initialMessages: AiMessage[] }) {
  const { language } = useAccessibility();
  const [functionType, setFunctionType] = useState<AiFunctionType>("career_advice");
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content }))
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

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
          functionType,
          language,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "The AI assistant is unavailable right now.");
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
        throw new Error(
          "The AI assistant couldn't generate a response. This usually means the Anthropic API key is missing billing/credits — please try again in a moment."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  }

  const activeFn = AI_FUNCTIONS.find((f) => f.value === functionType)!;

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-4">
      <FunctionPicker value={functionType} onChange={setFunctionType} />

      <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-border bg-card">
        <ScrollArea className="flex-1 px-5 py-4">
          <div aria-live="polite" className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                {activeFn.description}. Ask away — everything here is private to you.
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
            placeholder="Type your message..."
            aria-label="Message the AI assistant"
            rows={1}
            className="max-h-40 min-h-10 flex-1 resize-none rounded-2xl"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={isStreaming || !input.trim()}>
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
