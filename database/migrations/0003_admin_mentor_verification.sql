-- Career Connect — admin mentor verification
-- mentor_profiles previously had no admin bypass policy, so verifying a
-- mentor's is_verified flag (or promoting/demoting profiles.role, already
-- covered by profiles_admin_all) required going through the Supabase
-- dashboard directly. This adds the missing admin policy so the Admin
-- Analytics UI can manage mentor verification end to end.

create policy "mentor_profiles_admin_all" on mentor_profiles
  for all to authenticated using (is_admin()) with check (is_admin());
