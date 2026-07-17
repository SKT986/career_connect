import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTime } from "@/lib/format";
import type { AiUsageStats } from "@/types/domain";

export function AiUsagePanel({ usage }: { usage: AiUsageStats }) {
  const t = useTranslations("dashboard");

  if (usage.totalMessages === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        {t("aiUsageEmpty")}
      </p>
    );
  }

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">
          {t("messagesSentCount", { count: usage.totalMessages })}
          {usage.lastUsedAt && ` · ${t("lastUsed", { time: relativeTime(usage.lastUsedAt) })}`}
        </p>
      </CardContent>
    </Card>
  );
}
