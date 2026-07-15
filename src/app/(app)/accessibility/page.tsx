"use client";

import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const { fontScale, setFontScale, highContrast, setHighContrast, language, setLanguage } =
    useAccessibility();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accessibility Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Career Connect is built to adapt to you. These preferences apply everywhere in the app immediately.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Dark mode and contrast</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">High contrast</Label>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Text size</CardTitle>
          <CardDescription>Scale text across the whole app</CardDescription>
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
                {scale === 1 ? "Default" : scale === 1.15 ? "Large" : "Extra large"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>Choose the language for the interface and AI assistant</CardDescription>
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
          <CardTitle>Keyboard &amp; screen readers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Every interactive element in Career Connect is reachable by Tab and has a visible focus ring.</p>
          <p>Use the &quot;Skip to main content&quot; link (appears on first Tab press) to jump past navigation.</p>
          <p>Text-to-speech and speech-to-text for the AI Assistant and Mock Interview are coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
