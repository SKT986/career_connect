import type { LucideIcon } from "lucide-react";
import {
  MessagesSquare,
  Sparkles,
  GraduationCap,
  Mic,
  Building2,
  LayoutDashboard,
  Bell,
  User,
  Settings,
  Accessibility,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/feed", labelKey: "community", icon: MessagesSquare },
  { href: "/ai-assistant", labelKey: "aiAssistant", icon: Sparkles },
  { href: "/mentors", labelKey: "mentors", icon: GraduationCap },
  { href: "/mock-interview", labelKey: "mockInterview", icon: Mic },
  { href: "/companies", labelKey: "companies", icon: Building2 },
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
  { href: "/profile", labelKey: "profile", icon: User },
  { href: "/settings", labelKey: "settings", icon: Settings },
  { href: "/accessibility", labelKey: "accessibility", icon: Accessibility },
  { href: "/admin", labelKey: "admin", icon: ShieldCheck, adminOnly: true },
];

export const POST_CATEGORIES = [
  { value: "job_hunting", labelKey: "jobHunting" },
  { value: "interview", labelKey: "interview" },
  { value: "resume", labelKey: "resume" },
  { value: "mental_health", labelKey: "mentalHealth" },
  { value: "disability_support", labelKey: "disabilitySupport" },
  { value: "international_students", labelKey: "internationalStudents" },
  { value: "lgbtq", labelKey: "lgbtq" },
  { value: "workplace", labelKey: "workplace" },
  { value: "other", labelKey: "other" },
] as const;
