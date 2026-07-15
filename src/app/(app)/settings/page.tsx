import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/services/profileService";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { PasswordForm } from "@/components/settings/password-form";
import { SignOutButton } from "@/components/settings/sign-out-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getMyProfile(user.id);
  if (!profile) redirect("/login");

  const hasPasswordAuth = user.identities?.some((identity) => identity.provider === "email") ?? false;

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Account, privacy, and notification preferences. For dark mode, text size, and language, visit
          Accessibility.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Privacy &amp; notifications</h2>
        <PreferencesForm profile={profile} />
      </section>

      {hasPasswordAuth && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Password</h2>
          <PasswordForm />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Account</h2>
        <SignOutButton />
      </section>
    </div>
  );
}
