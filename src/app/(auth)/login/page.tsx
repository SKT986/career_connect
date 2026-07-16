"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/shared/submit-button";
import { OAuthButtons } from "@/components/shared/oauth-buttons";
import { signInAction, type AuthActionState } from "@/services/authService";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("login.welcomeBack")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthButtons />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">{t("login.orWithEmail")}</span>
          <Separator className="flex-1" />
        </div>

        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t("universityEmail")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@university.ac.jp" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("password")}</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                {t("login.forgotPassword")}
              </Link>
            </div>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">{t("login.signIn")}</SubmitButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("login.newToCareerConnect")}{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            {t("login.createAccount")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
