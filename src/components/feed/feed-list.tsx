"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PostCard } from "@/components/feed/post-card";
import { MessagesSquare } from "lucide-react";
import type { FeedPost } from "@/types/domain";

export function FeedList({ posts }: { posts: FeedPost[] }) {
  const t = useTranslations("feed");

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MessagesSquare className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium">{t("emptyTitle")}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{t("emptyDescription")}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post, i) => (
        <motion.li
          key={post.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
        >
          <PostCard post={post} href={`/feed/${post.id}`} />
        </motion.li>
      ))}
    </ul>
  );
}
