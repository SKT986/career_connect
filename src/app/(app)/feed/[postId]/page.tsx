import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostById, getCommentsForPost } from "@/services/postsService";
import { getCurrentUserRole } from "@/services/mentorService";
import { PostCard } from "@/components/feed/post-card";
import { CommentList } from "@/components/feed/comment-list";
import { CommentComposer } from "@/components/feed/comment-composer";
import { Separator } from "@/components/ui/separator";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await getPostById(postId);
  if (!post) notFound();

  const [comments, role] = await Promise.all([getCommentsForPost(postId), getCurrentUserRole()]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to community
      </Link>

      <PostCard post={post} />

      <Separator />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </h2>
        <CommentComposer postId={postId} allowIdentityReveal={role === "mentor"} />
        <CommentList comments={comments} />
      </div>
    </div>
  );
}
