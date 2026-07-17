"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { signUpAction, type AuthActionState } from "@/services/authService";

const initialState: AuthActionState = {};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
        <CardDescription>{t("register.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="displayName">{t("register.displayName")}</Label>
            <Input id="displayName" name="displayName" required placeholder={t("register.displayNamePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("universityEmail")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@university.ac.jp" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
            <p className="text-xs text-muted-foreground">{t("register.passwordHint")}</p>
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">{t("register.createAccount")}</SubmitButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("register.alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {t("register.signIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
