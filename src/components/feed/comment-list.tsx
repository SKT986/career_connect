import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { relativeTime } from "@/lib/format";
import type { FeedComment } from "@/types/domain";

export function CommentList({ comments }: { comments: FeedComment[] }) {
  if (comments.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No replies yet. Be the first to respond.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {comment.authorLabel.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 rounded-2xl bg-muted/60 px-4 py-2.5">
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-medium">{comment.authorLabel}</p>
              {comment.isMentor && (
                <Badge className="gap-1 rounded-full font-normal">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  Mentor
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">{relativeTime(comment.createdAt)}</p>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/90">{comment.content}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
