import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/format";
import type { PostCategory } from "@/types/database.types";

export function CategoryBadge({ category }: { category: PostCategory }) {
  const t = useTranslations("postCategories");
  return (
    <Badge variant="secondary" className="rounded-full font-normal">
      {categoryLabel(category, t)}
    </Badge>
  );
}
