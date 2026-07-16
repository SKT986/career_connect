"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Menu, Moon, Sun, ALargeSmall, Contrast, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useUnreadNotificationCount } from "@/hooks/use-unread-notification-count";
import { createClient } from "@/lib/supabase/client";

export function Topbar({
  userId,
  displayName,
  avatarUrl,
  role,
  initialUnreadCount,
}: {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  initialUnreadCount: number;
}) {
  const { theme, setTheme } = useTheme();
  const { fontScale, setFontScale, highContrast, setHighContrast } = useAccessibility();
  const router = useRouter();
  const unreadCount = useUnreadNotificationCount(userId, initialUnreadCount);
  const t = useTranslations("topbar");
  const tNav = useTranslations("nav");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={tNav("openMenu")}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{tNav("navigationTitle")}</SheetTitle>
            </SheetHeader>
            <SidebarNav role={role} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={unreadCount > 0 ? t("notificationsUnread", { count: unreadCount }) : t("notifications")}
              onClick={() => router.push("/notifications")}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("notifications")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-pressed={fontScale > 1}
              aria-label={t("toggleLargeText")}
              onClick={() => setFontScale(fontScale > 1 ? 1 : 1.25)}
            >
              <ALargeSmall className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("largeText")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-pressed={highContrast}
              aria-label={t("toggleHighContrast")}
              onClick={() => setHighContrast(!highContrast)}
            >
              <Contrast className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("highContrast")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("toggleDarkMode")}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="hidden h-5 w-5 dark:block" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("darkMode")}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-1 gap-2 rounded-full px-1.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>{t("profile")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>{t("settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
