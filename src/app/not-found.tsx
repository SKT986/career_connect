import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{t("pageNotFoundTitle")}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t("pageNotFoundDescription")}</p>
      </div>
      <Button asChild>
        <Link href="/">{t("backToHome")}</Link>
      </Button>
    </div>
  );
}
