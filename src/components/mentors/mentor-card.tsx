import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import type { MentorProfileSummary } from "@/types/domain";

export function MentorCard({ mentor }: { mentor: MentorProfileSummary }) {
  const t = useTranslations("mentors");
  return (
    <Card className="h-full rounded-3xl">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {mentor.displayName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{mentor.displayName}</p>
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t("verifiedMentor")}
            </span>
          </div>
        </div>

        {mentor.headline && <p className="text-sm text-muted-foreground">{mentor.headline}</p>}

        {mentor.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mentor.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="rounded-full font-normal">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
