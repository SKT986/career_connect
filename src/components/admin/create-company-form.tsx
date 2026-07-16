"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { createCompanyAccountAction, type AdminActionResult } from "@/services/adminActions";

const initialState: AdminActionResult = {};

export function CreateCompanyForm() {
  const t = useTranslations("admin");
  const [state, formAction] = useActionState(createCompanyAccountAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(t("inviteSent"));
      formRef.current?.reset();
    }
    if (state.error) toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-5">
        <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label htmlFor="company-rep-email">{t("repsEmail")}</Label>
            <Input id="company-rep-email" name="email" type="email" required placeholder="hiring@company.com" />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1.5">
            <Label htmlFor="company-rep-name">{t("contactName")}</Label>
            <Input id="company-rep-name" name="displayName" required placeholder="Jane Recruiter" />
          </div>
          <SubmitButton className="gap-1.5 rounded-full">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("invite")}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
