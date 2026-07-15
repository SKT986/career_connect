"use client";

import { useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/shared/submit-button";
import { upsertMentorProfileAction, type MentorActionState } from "@/services/mentorActions";
import type { MentorProfileSummary } from "@/types/domain";

const initialState: MentorActionState = {};

export function MentorProfileSetup({ mentorProfile }: { mentorProfile: MentorProfileSummary | null }) {
  const [state, formAction] = useActionState(upsertMentorProfileAction, initialState);

  return (
    <Card className="rounded-3xl border-primary/30 bg-accent/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Your mentor profile</CardTitle>
          <Badge variant={mentorProfile?.isVerified ? "default" : "secondary"} className="rounded-full font-normal">
            {mentorProfile?.isVerified ? "Verified" : "Pending verification"}
          </Badge>
        </div>
        <CardDescription>
          {mentorProfile?.isVerified
            ? "Students can see your headline and badges in the mentor directory."
            : "Your profile will appear in the directory once an admin verifies your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              required
              maxLength={140}
              defaultValue={mentorProfile?.headline ?? ""}
              placeholder="e.g. Ex-Google SWE helping international students land new-grad roles"
            />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <SubmitButton className="rounded-full" variant="outline">
            {mentorProfile ? "Update headline" : "Save headline"}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
