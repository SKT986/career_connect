"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
  success?: boolean;
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

const MIN_PASSWORD_LENGTH = 8;

// Used by /set-password — the landing page for invite and password-recovery
// links. Those links are generated server-side (by an admin, or by
// requestPasswordResetAction below), so there's no client-initiated PKCE
// flow to complete; the browser establishes the session itself from the
// link (see set-password/page.tsx), and by the time this action runs that
// session is already on the request's cookies.
export async function setPasswordAndVerifyAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your link has expired. Request a new one." };

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  await supabase
    .from("profiles")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", user.id)
    .is("verified_at", null);

  redirect("/feed");
}

export async function requestPasswordResetAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
  });

  // Always report success, whether or not the email is registered, so this
  // can't be used to enumerate accounts.
  return { success: true };
}
