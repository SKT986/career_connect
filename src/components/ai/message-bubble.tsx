import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

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
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isAssistant ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        {content}
        {isStreaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" />}
      </div>
    </div>
  );
}
