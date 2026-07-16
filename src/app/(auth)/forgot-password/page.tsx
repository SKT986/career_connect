"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { requestPasswordResetAction, type AuthActionState } from "@/services/authService";

const initialState: AuthActionState = {};

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <Card className="rounded-3xl shadow-lg">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <CardTitle className="text-2xl">{t("forgotPassword.checkInbox")}</CardTitle>
          <CardDescription>{t("forgotPassword.checkInboxDescription")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("forgotPassword.title")}</CardTitle>
        <CardDescription>{t("forgotPassword.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@university.ac.jp" />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">{t("forgotPassword.sendResetLink")}</SubmitButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {t("forgotPassword.backToSignIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
