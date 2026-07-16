"use client";

import { useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/shared/submit-button";
import { createCompanyAction, type CompanyActionState } from "@/services/companiesActions";

const initialState: CompanyActionState = {};

export function CompanySetupForm() {
  const [state, formAction] = useActionState(createCompanyAction, initialState);

  return (
    <Card className="mx-auto max-w-xl rounded-3xl">
      <CardHeader>
        <CardTitle>Set up your company</CardTitle>
        <CardDescription>
          This is what students see on job listings. Once saved, you can start posting roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company name</Label>
            <Input id="name" name="name" required maxLength={120} placeholder="Acme Inc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              maxLength={1000}
              placeholder="What you do, and what you look for in candidates."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://acme.com" />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <SubmitButton className="rounded-full">Save company</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
