import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { AmaSession } from "@/types/domain";

export function AmaSessionCard({ session }: { session: AmaSession }) {
  const t = useTranslations("mentors");
  return (
    <Card className="h-full rounded-3xl">
      <CardContent className="flex flex-col gap-2 p-5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDateTime(session.scheduledAt)}
        </span>
        <p className="font-medium">{session.title}</p>
        <p className="text-xs text-muted-foreground">{t("hostedBy", { name: session.mentorName })}</p>
        {session.description && (
          <p className="text-sm text-muted-foreground">{session.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
