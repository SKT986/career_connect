"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { createJobAction, type CompanyActionState } from "@/services/companiesActions";

const initialState: CompanyActionState = {};

export function JobComposer() {
  const t = useTranslations("companies");
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createJobAction, initialState);
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
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" /> {t("postARole")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("postARole")}</DialogTitle>
          <DialogDescription>{t("postARoleDescription")}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input id="title" name="title" required maxLength={120} placeholder={t("jobTitlePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t("locationOptional")}</Label>
            <Input id="location" name="location" maxLength={120} placeholder={t("locationPlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionOptional")}</Label>
            <Textarea id="description" name="description" rows={4} maxLength={1000} placeholder={t("jobDescriptionPlaceholder")} />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">{t("postRole")}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
