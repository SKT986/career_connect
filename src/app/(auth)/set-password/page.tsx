"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { createClient } from "@/lib/supabase/client";
import { setPasswordAndVerifyAction, type AuthActionState } from "@/services/authService";

const initialState: AuthActionState = {};

export default function SetPasswordPage() {
  const t = useTranslations("auth");
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [state, formAction] = useActionState(setPasswordAndVerifyAction, initialState);

  useEffect(() => {
    async function establishSession() {
      const supabase = createClient();

      // Invite/recovery links generated server-side (by an admin, or by
      // requestPasswordResetAction) have no client-initiated PKCE flow, so
      // they may land here as either `?code=` or a `#access_token=` hash.
      // The browser client auto-consumes the hash on construction above;
      // handle the code case explicitly and let either path fall through
      // to the getUser() check below.
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setStatus(user ? "ready" : "invalid");
    }

    establishSession();
  }, []);

  if (status === "checking") {
    return (
      <Card className="rounded-3xl shadow-lg">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t("setPassword.confirmingLink")}</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "invalid") {
    return (
      <Card className="rounded-3xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("setPassword.linkExpired")}</CardTitle>
          <CardDescription>{t("setPassword.linkExpiredDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/forgot-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {t("setPassword.requestNewLink")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("setPassword.title")}</CardTitle>
        <CardDescription>{t("setPassword.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("setPassword.newPassword")}</Label>
            <Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("setPassword.confirmPassword")}</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">{t("setPassword.continue")}</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
