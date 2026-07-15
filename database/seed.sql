-- Local/dev seed data. Safe to re-run: uses fixed UUIDs with on-conflict do nothing.
-- NOTE: requires matching auth.users rows to exist first (create them via
-- Supabase Auth sign-up, then re-run this to backfill demo posts).

insert into settings (key, value)
values ('feature_flags', '{"mock_interview_voice": false}'::jsonb)
on conflict (key) do nothing;
