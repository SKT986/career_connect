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
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "Community", icon: MessagesSquare },
  { href: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/mentors", label: "Mentors", icon: GraduationCap },
  { href: "/mock-interview", label: "Mock Interview", icon: Mic },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/accessibility", label: "Accessibility", icon: Accessibility },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

export const POST_CATEGORIES = [
  { value: "job_hunting", label: "Job Hunting" },
  { value: "interview", label: "Interview" },
  { value: "resume", label: "Resume" },
  { value: "mental_health", label: "Mental Health" },
  { value: "disability_support", label: "Disability Support" },
  { value: "international_students", label: "International Students" },
  { value: "lgbtq", label: "LGBTQ+" },
  { value: "workplace", label: "Workplace" },
  { value: "other", label: "Other" },
] as const;
