import { formatDistanceToNowStrict, format } from "date-fns";
import { POST_CATEGORIES } from "@/lib/nav";
import type { PostCategory } from "@/types/database.types";

export function relativeTime(iso: string) {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "MMM d, h:mm a");
}

export function categoryLabel(category: PostCategory) {
  return POST_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}
