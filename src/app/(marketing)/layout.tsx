import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("marketing");
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" aria-hidden="true" />
            </span>
            Career Connect
          </Link>
          <nav aria-label={t("primaryNav")} className="flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/login">{t("signIn")}</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/register">{t("getStarted")}</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground sm:px-6">
          <p>{t("footerTagline")}</p>
          <p>{t("footerCopyright", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
}
