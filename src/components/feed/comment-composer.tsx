"use client";

import { useActionState, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/shared/submit-button";
import { createCommentAction, type PostActionState } from "@/services/postsActions";

const initialState: PostActionState = {};

export function CommentComposer({ postId, allowIdentityReveal = false }: { postId: string; allowIdentityReveal?: boolean }) {
  const action = createCommentAction.bind(null, postId);
  const [state, formAction] = useActionState(action, initialState);
  const [isAnonymous, setIsAnonymous] = useState(true);

  return (
    <form action={formAction} className="space-y-2">
      <Textarea
        name="content"
        required
        rows={3}
        maxLength={1000}
        placeholder="Add a supportive reply..."
        aria-label="Write a comment"
      />
      {allowIdentityReveal && (
        <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
          <Label htmlFor="comment-isAnonymous" className="cursor-pointer text-sm font-normal text-muted-foreground">
            Reply anonymously
          </Label>
          <input type="hidden" name="isAnonymous" value={String(isAnonymous)} />
          <Switch id="comment-isAnonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
        </div>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <SubmitButton className="rounded-full">Reply</SubmitButton>
      </div>
    </form>
  );
}
