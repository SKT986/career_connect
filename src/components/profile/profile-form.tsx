"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Camera, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/shared/submit-button";
import { updateProfileAction, type ProfileActionState } from "@/services/profileActions";
import { formatDate } from "@/lib/format";
import type { ProfileSummary } from "@/types/domain";
import type { UserRole } from "@/types/database.types";

const initialState: ProfileActionState = {};

const ROLE_KEYS: Record<UserRole, string> = {
  student: "roleStudent",
  mentor: "roleMentor",
  company: "roleCompany",
  admin: "roleAdmin",
};

export function ProfileForm({ profile }: { profile: ProfileSummary }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success(t("profileUpdated"));
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "avatars");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok) setAvatarUrl(json.url);
      else toast.error(json.error ?? t("avatarUploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-6">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />

          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span className="sr-only">{t("changeAvatar")}</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full font-normal">
                {t(ROLE_KEYS[profile.role])}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t("memberSince", { date: formatDate(profile.createdAt) })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">{t("displayName")}</Label>
            <Input id="displayName" name="displayName" required maxLength={60} defaultValue={profile.displayName} />
            <p className="text-xs text-muted-foreground">{t("displayNameHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t("bio")}</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={500}
              defaultValue={profile.bio ?? ""}
              placeholder={t("bioPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("universityEmail")}</Label>
            <Input value={profile.universityEmail ?? t("notSet")} disabled />
            <p className="text-xs text-muted-foreground">{t("universityEmailHint")}</p>
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="rounded-full">{t("saveChanges")}</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
