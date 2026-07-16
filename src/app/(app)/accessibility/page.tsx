"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useAccessibility, type AppLanguage } from "@/hooks/use-accessibility";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGUAGES: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "ja-easy", label: "やさしい日本語 (Easy Japanese)" },
];

export default function AccessibilityPage() {
  const t = useTranslations("accessibility");
  const { theme, setTheme } = useTheme();
  const { fontScale, setFontScale, highContrast, setHighContrast, language, setLanguage } =
    useAccessibility();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{t("appearance")}</CardTitle>
          <CardDescription>{t("appearanceDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">{t("darkMode")}</Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">{t("highContrast")}</Label>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{t("textSize")}</CardTitle>
          <CardDescription>{t("textSizeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 1.15, 1.35].map((scale) => (
              <Button
                key={scale}
                type="button"
                variant={fontScale === scale ? "default" : "outline"}
                className={cn("rounded-full")}
                onClick={() => setFontScale(scale)}
                aria-pressed={fontScale === scale}
              >
                {scale === 1 ? t("default") : scale === 1.15 ? t("large") : t("extraLarge")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
          <CardDescription>{t("languageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Button
                key={l.value}
                type="button"
                variant={language === l.value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setLanguage(l.value)}
                aria-pressed={language === l.value}
              >
                {l.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{t("keyboardScreenReaders")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("keyboardNote")}</p>
          <p>{t("skipLinkNote")}</p>
          <p>{t("voiceModeNote")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
