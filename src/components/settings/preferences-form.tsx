"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/shared/submit-button";
import { updatePreferencesAction, type SettingsActionState } from "@/services/settingsActions";
import type { ProfileSummary } from "@/types/domain";

const initialState: SettingsActionState = {};

export function PreferencesForm({ profile }: { profile: ProfileSummary }) {
  const [state, formAction] = useActionState(updatePreferencesAction, initialState);
  const [defaultAnonymous, setDefaultAnonymous] = useState(profile.defaultAnonymous);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notificationsEnabled);

  useEffect(() => {
    if (state.success) toast.success("Preferences saved.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card className="rounded-3xl">
      <CardContent className="space-y-4 p-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="defaultAnonymous" value={String(defaultAnonymous)} />
          <input type="hidden" name="notificationsEnabled" value={String(notificationsEnabled)} />

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
            <div>
              <Label htmlFor="default-anonymous" className="cursor-pointer">
                Post anonymously by default
              </Label>
              <p className="text-xs text-muted-foreground">
                New posts and mentor replies start with anonymous mode on. You can still change it per post.
              </p>
            </div>
            <Switch id="default-anonymous" checked={defaultAnonymous} onCheckedChange={setDefaultAnonymous} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
            <div>
              <Label htmlFor="notifications-enabled" className="cursor-pointer">
                Notify me about replies &amp; mentor comments
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn off to stop new in-app notifications for activity on your posts.
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <SubmitButton className="rounded-full">Save preferences</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
