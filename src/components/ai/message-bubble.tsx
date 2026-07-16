"use client";

import { useTranslations } from "next-intl";
import { Volume2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/hooks/use-accessibility";
import { speak, speechLangFor } from "@/hooks/use-speech-recognition";

export function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}) {
  const t = useTranslations("aiAssistant");
  const { language } = useAccessibility();
  const isAssistant = role === "assistant";

  return (
    <div className={cn("flex gap-3", !isAssistant && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        {isAssistant ? (
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-secondary text-secondary-foreground">{t("you")}</AvatarFallback>
        )}
      </Avatar>
      <div className={cn("flex max-w-[80%] items-start gap-1", !isAssistant && "flex-row-reverse")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isAssistant ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
          )}
        >
          {content}
          {isStreaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" />}
        </div>
        {isAssistant && !isStreaming && content && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-1 h-7 w-7 shrink-0 rounded-full text-muted-foreground"
            onClick={() => speak(content, speechLangFor(language))}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span className="sr-only">{t("readAloud")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
