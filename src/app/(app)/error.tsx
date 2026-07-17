"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{t("genericError")}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t("genericErrorDescription")}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>{t("tryAgain")}</Button>
        <Button variant="outline" asChild>
          <Link href="/feed">{t("backToHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
