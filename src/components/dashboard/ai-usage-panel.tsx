import { Card, CardContent } from "@/components/ui/card";
import { AI_FUNCTIONS } from "@/lib/ai-functions";
import { relativeTime } from "@/lib/format";
import type { AiUsageStats } from "@/types/domain";

export function AiUsagePanel({ usage }: { usage: AiUsageStats }) {
  if (usage.totalMessages === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        Your AI Assistant usage will show up here once you start a conversation.
      </p>
    );
  }

  const maxCount = Math.max(...usage.byFunctionType.map((f) => f.count), 1);

  return (
    <Card className="rounded-3xl">
      <CardContent className="space-y-4 p-5">
        <p className="text-sm text-muted-foreground">
          {usage.totalMessages} message{usage.totalMessages === 1 ? "" : "s"} sent
          {usage.lastUsedAt && ` · last used ${relativeTime(usage.lastUsedAt)}`}
        </p>
        <div className="space-y-3">
          {usage.byFunctionType.map(({ functionType, count }) => {
            const fn = AI_FUNCTIONS.find((f) => f.value === functionType);
            return (
              <div key={functionType} className="flex items-center gap-3">
                {fn && <fn.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
                <span className="w-36 shrink-0 truncate text-sm">{fn?.label ?? functionType}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
