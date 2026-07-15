import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex items-start gap-3 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {sublabel && <p className="mt-0.5 text-xs text-muted-foreground/80">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
