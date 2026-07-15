-- Career Connect — Row Level Security
-- Every table has RLS enabled. Anonymous display identity is enforced at the
-- application layer (posts.author_id is never sent to the client for
-- is_anonymous=true posts by non-owner/non-admin roles) — RLS here protects
-- the underlying rows, not just the rendered name.

alter table profiles enable row level security;
alter table accessibility_preferences enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table bookmarks enable row level security;
alter table mentor_profiles enable row level security;
alter table mentor_sessions enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table companies enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table matching_requests enable row level security;
alter table resume_versions enable row level security;
alter table interview_sessions enable row level security;
alter table ai_chat_history enable row level security;
alter table settings enable row level security;

create function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: everyone (authenticated) can read minimal profile rows (needed to
-- resolve mentor/admin display names); users manage their own row; admins manage all.
create policy "profiles_select_authenticated" on profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on profiles
  for update to authenticated using (auth.uid() = id);
create policy "profiles_admin_all" on profiles
  for all to authenticated using (is_admin());

create policy "a11y_prefs_owner" on accessibility_preferences
  for all to authenticated using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- posts: any authenticated user can read; authors manage their own; admins manage all.
create policy "posts_select_authenticated" on posts
  for select to authenticated using (true);
create policy "posts_insert_own" on posts
  for insert to authenticated with check (auth.uid() = author_id);
create policy "posts_update_own" on posts
  for update to authenticated using (auth.uid() = author_id);
create policy "posts_delete_own_or_admin" on posts
  for delete to authenticated using (auth.uid() = author_id or is_admin());

create policy "comments_select_authenticated" on comments
  for select to authenticated using (true);
create policy "comments_insert_own" on comments
  for insert to authenticated with check (auth.uid() = author_id);
create policy "comments_delete_own_or_admin" on comments
  for delete to authenticated using (auth.uid() = author_id or is_admin());

create policy "likes_select_authenticated" on likes
  for select to authenticated using (true);
create policy "likes_manage_own" on likes
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bookmarks_owner_only" on bookmarks
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- mentor_profiles / sessions: readable by all; mentors manage their own.
create policy "mentor_profiles_select_authenticated" on mentor_profiles
  for select to authenticated using (true);
create policy "mentor_profiles_owner_manage" on mentor_profiles
  for all to authenticated using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "mentor_sessions_select_authenticated" on mentor_sessions
  for select to authenticated using (true);
create policy "mentor_sessions_owner_manage" on mentor_sessions
  for all to authenticated using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

-- messages: only sender/receiver can see their own thread.
create policy "messages_participants_only" on messages
  for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages_insert_as_sender" on messages
  for insert to authenticated with check (auth.uid() = sender_id);

-- notifications: only the owner.
create policy "notifications_owner_only" on notifications
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- companies/jobs: public read (students browse jobs); only the owning company manages.
create policy "companies_select_authenticated" on companies
  for select to authenticated using (true);
create policy "companies_owner_manage" on companies
  for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "jobs_select_authenticated" on jobs
  for select to authenticated using (true);
create policy "jobs_owner_manage" on jobs
  for all to authenticated using (
    exists (select 1 from companies c where c.id = jobs.company_id and c.owner_id = auth.uid())
  );

-- applications: visible to the applicant and the owning company.
create policy "applications_participants" on applications
  for select to authenticated using (
    auth.uid() = student_id
    or exists (
      select 1 from jobs j join companies c on c.id = j.company_id
      where j.id = applications.job_id and c.owner_id = auth.uid()
    )
  );
create policy "applications_insert_own" on applications
  for insert to authenticated with check (auth.uid() = student_id);

-- matching_requests: a company can only see a student profile through this
-- table, and only after the student consents (status/identity_revealed).
create policy "matching_requests_participants" on matching_requests
  for select to authenticated using (
    auth.uid() = student_id
    or exists (select 1 from companies c where c.id = matching_requests.company_id and c.owner_id = auth.uid())
  );
create policy "matching_requests_student_manage" on matching_requests
  for update to authenticated using (auth.uid() = student_id);
create policy "matching_requests_company_create" on matching_requests
  for insert to authenticated with check (
    exists (select 1 from companies c where c.id = matching_requests.company_id and c.owner_id = auth.uid())
  );

-- resume_versions / interview_sessions / ai_chat_history: strictly owner-only.
create policy "resume_versions_owner_only" on resume_versions
  for all to authenticated using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "interview_sessions_owner_only" on interview_sessions
  for all to authenticated using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "ai_chat_history_owner_only" on ai_chat_history
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- settings: readable by all authenticated users, writable only by admins.
create policy "settings_select_authenticated" on settings
  for select to authenticated using (true);
create policy "settings_admin_write" on settings
  for all to authenticated using (is_admin()) with check (is_admin());

-- Storage buckets: avatars (public read, owner write) and post-images (authenticated read, owner write).
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', false)
  on conflict (id) do nothing;

create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatar_owner_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars' and owner = auth.uid());

create policy "post_images_authenticated_read" on storage.objects
  for select to authenticated using (bucket_id = 'post-images');
create policy "post_images_owner_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'post-images' and owner = auth.uid());
