"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { createAmaSessionAction, type MentorActionState } from "@/services/mentorActions";

const initialState: MentorActionState = {};

export function HostAmaDialog() {
  const t = useTranslations("mentors");
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createAmaSessionAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full">
          <CalendarPlus className="h-4 w-4" /> {t("hostAnAma")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("scheduleAmaSession")}</DialogTitle>
          <DialogDescription>{t("scheduleAmaDescription")}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input id="title" name="title" required maxLength={120} placeholder={t("titlePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">{t("dateAndTime")}</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionOptional")}</Label>
            <Textarea id="description" name="description" rows={3} maxLength={1000} placeholder={t("descriptionPlaceholder")} />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">{t("scheduleAma")}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
