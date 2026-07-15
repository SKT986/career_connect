"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/shared/submit-button";
import { OAuthButtons } from "@/components/shared/oauth-buttons";
import { signInAction, type AuthActionState } from "@/services/authService";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>A safe space for your career journey. Sign in to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthButtons />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or with email</span>
          <Separator className="flex-1" />
        </div>

        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">University email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@university.ac.jp" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-full">Sign in</SubmitButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New to Career Connect?{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
