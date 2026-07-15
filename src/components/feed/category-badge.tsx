import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/format";
import type { PostCategory } from "@/types/database.types";

export function CategoryBadge({ category }: { category: PostCategory }) {
  return (
    <Badge variant="secondary" className="rounded-full font-normal">
      {categoryLabel(category)}
    </Badge>
  );
}
