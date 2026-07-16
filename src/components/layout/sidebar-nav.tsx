"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { Heart } from "lucide-react";

export function SidebarNav({
  role,
  onNavigate,
}: {
  role: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav aria-label={t("mainNavigation")} className="flex h-full flex-col gap-1 p-3">
      <Link
        href="/feed"
        className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-semibold tracking-tight"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Heart className="h-4 w-4" aria-hidden="true" />
        </span>
        Career Connect
      </Link>

      {NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin").map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80"
            )}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
