-- Career Connect — settings preferences
-- Backs the new /settings page: a per-user default for the "post
-- anonymously" toggle, and an opt-out for in-app reply/mentor-comment
-- notifications. Both live on profiles since they're owner-writable via the
-- existing profiles_update_own RLS policy — no new policy needed.

alter table profiles
  add column default_anonymous boolean not null default true,
  add column notifications_enabled boolean not null default true;
