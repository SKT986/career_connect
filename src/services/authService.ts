"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
}

async function getAllowedEmailDomains(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "allowed_university_email_domains")
    .single();

  const domains = (data?.value as string[] | undefined) ?? [];
  return domains;
}

function emailMatchesDomain(email: string, domains: string[]) {
  if (domains.length === 0) return true;
  const lower = email.toLowerCase();
  return domains.some((d) => lower.endsWith(d.toLowerCase()));
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password || !displayName) {
    return { error: "Please fill in every field." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const allowedDomains = await getAllowedEmailDomains(supabase);

  if (!emailMatchesDomain(email, allowedDomains)) {
    return {
      error: `Please use a university email address (e.g. ending in ${allowedDomains.join(", ")}).`,
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  redirect("/verify-email");
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/feed");
}
