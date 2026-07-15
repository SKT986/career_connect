"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/feed/category-badge";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toggleLikeAction, toggleBookmarkAction } from "@/services/postsActions";
import type { FeedPost } from "@/types/domain";

export function PostCard({ post, href }: { post: FeedPost; href?: string }) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: post.likedByViewer, likeCount: post.likeCount, bookmarked: post.bookmarkedByViewer },
    (state, action: "like" | "bookmark") =>
      action === "like"
        ? { ...state, liked: !state.liked, likeCount: state.likeCount + (state.liked ? -1 : 1) }
        : { ...state, bookmarked: !state.bookmarked }
  );

  function handleLike() {
    startTransition(async () => {
      setOptimistic("like");
      await toggleLikeAction(post.id);
    });
  }

  function handleBookmark() {
    startTransition(async () => {
      setOptimistic("bookmark");
      await toggleBookmarkAction(post.id);
    });
  }

  const header = (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {post.authorLabel.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{post.authorLabel}</p>
        <p className="text-xs text-muted-foreground">{relativeTime(post.createdAt)}</p>
      </div>
      <CategoryBadge category={post.category} />
    </div>
  );

  const content = (
    <>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.content}</p>
      {post.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
          <Image src={post.imageUrl} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
    </>
  );

  return (
    <Card className="h-full rounded-3xl transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-5">
        {href ? (
          <Link
            href={href}
            className="flex flex-col gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {header}
            {content}
          </Link>
        ) : (
          <>
            {header}
            {content}
          </>
        )}

        <div className="mt-1 flex items-center gap-1 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5 rounded-full", optimistic.liked && "text-destructive")}
            onClick={handleLike}
            disabled={isPending}
            aria-pressed={optimistic.liked}
            aria-label={optimistic.liked ? "Unlike post" : "Like post"}
          >
            <motion.span whileTap={{ scale: 1.3 }} className="flex">
              <Heart className={cn("h-4 w-4", optimistic.liked && "fill-current")} />
            </motion.span>
            {optimistic.likeCount}
          </Button>
          <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm">
            <MessageCircle className="h-4 w-4" />
            {post.commentCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={cn("ml-auto rounded-full", optimistic.bookmarked && "text-primary")}
            onClick={handleBookmark}
            disabled={isPending}
            aria-pressed={optimistic.bookmarked}
            aria-label={optimistic.bookmarked ? "Remove bookmark" : "Bookmark post"}
          >
            <Bookmark className={cn("h-4 w-4", optimistic.bookmarked && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
