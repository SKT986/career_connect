import { getFeedPosts } from "@/services/postsService";
import { PostComposer } from "@/components/feed/post-composer";
import { CategoryFilter } from "@/components/feed/category-filter";
import { SearchBar } from "@/components/feed/search-bar";
import { FeedList } from "@/components/feed/feed-list";
import type { PostCategory } from "@/types/database.types";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = (params.category as PostCategory | undefined) ?? "all";
  const posts = await getFeedPosts({ category, search: params.q });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
          <p className="text-sm text-muted-foreground">A safe space to ask, share, and support each other.</p>
        </div>
        <PostComposer />
      </div>

      <SearchBar />
      <CategoryFilter />

      <FeedList posts={posts} />
    </div>
  );
}
