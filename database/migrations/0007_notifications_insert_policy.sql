-- Career Connect — fix notification creation
-- notifications_owner_only (0002_rls.sql) only let a user write rows where
-- auth.uid() = user_id, which silently blocked every real notification:
-- they're always created by someone OTHER than the recipient (a commenter
-- notifying a post author, a company notifying a student). Adding a
-- permissive insert-only policy lets any authenticated user create a
-- notification for anyone; select/update/delete stay owner-only via the
-- existing policy.

create policy "notifications_insert_any" on notifications
  for insert to authenticated with check (true);
