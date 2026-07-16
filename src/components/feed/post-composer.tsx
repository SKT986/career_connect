"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ImagePlus, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/shared/submit-button";
import { POST_CATEGORIES } from "@/lib/nav";
import { createPostAction, type PostActionState } from "@/services/postsActions";

const initialState: PostActionState = {};

export function PostComposer({ defaultAnonymous = true }: { defaultAnonymous?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createPostAction, initialState);
  const [category, setCategory] = useState("job_hunting");
  const [isAnonymous, setIsAnonymous] = useState(defaultAnonymous);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const tCategories = useTranslations("postCategories");
  const t = useTranslations("feed");

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setImageUrl(null);
      router.refresh();
    }
    // Depend on the whole state object (a fresh reference each dispatch),
    // since `success` alone can be `true` -> `true` across two submissions.
  }, [state, router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok) setImageUrl(json.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" /> {t("newPost")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("askTheCommunity")}</DialogTitle>
          <DialogDescription>{t("anonymousByDefault")}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">{t("whatsOnYourMind")}</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={5}
              maxLength={4000}
              placeholder={t("postPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("category")}</Label>
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {tCategories(c.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <Label htmlFor="isAnonymous" className="cursor-pointer">
              {t("postAnonymously")}
            </Label>
            <input type="hidden" name="isAnonymous" value={String(isAnonymous)} />
            <Switch id="isAnonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          <div className="space-y-2">
            <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />
            {imageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="max-h-48 w-full rounded-xl object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 rounded-full"
                  onClick={() => setImageUrl(null)}
                  aria-label={t("removeImage")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-xl"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {t("addImage")}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">{t("post")}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
