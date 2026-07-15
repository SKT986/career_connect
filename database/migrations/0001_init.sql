-- Career Connect — initial schema
-- Full normalized schema per product spec. The MVP application code only
-- actively reads/writes a subset of these tables (profiles, posts, comments,
-- likes, bookmarks, ai_chat_history, accessibility_preferences); the rest are
-- provisioned now so later feature work never needs a breaking migration.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('student', 'mentor', 'company', 'admin');

create type post_category as enum (
  'job_hunting',
  'interview',
  'resume',
  'mental_health',
  'disability_support',
  'international_students',
  'lgbtq',
  'workplace',
  'other'
);

create type notification_type as enum (
  'reply', 'mentor_comment', 'interview_completed', 'company_invitation', 'system'
);

create type application_status as enum ('submitted', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn');
create type matching_status as enum ('pending', 'accepted', 'declined', 'revealed');
create type interview_mode as enum ('text', 'voice');
create type interview_difficulty as enum ('easy', 'medium', 'hard');
create type resume_language as enum ('en', 'ja');
create type ai_function_type as enum (
  'resume_feedback', 'interview_practice', 'career_advice', 'job_recommendation',
  'strength_analysis', 'weakness_analysis', 'star_answer', 'cover_letter'
);

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'student',
  display_name text not null default 'Anonymous',
  anonymous_alias text not null default ('Anon-' || substr(md5(random()::text), 1, 6)),
  university_email text,
  avatar_url text,
  bio text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table accessibility_preferences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  dark_mode boolean not null default false,
  font_scale numeric not null default 1.0,
  high_contrast boolean not null default false,
  language text not null default 'en', -- 'en' | 'ja' | 'ja-easy'
  screen_reader_optimized boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Anonymous community
-- ---------------------------------------------------------------------------
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  is_anonymous boolean not null default true,
  category post_category not null default 'other',
  content text not null,
  image_url text,
  search_vector tsvector generated always as (to_tsvector('english', content)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_search_idx on posts using gin (search_vector);
create index posts_category_idx on posts (category);
create index posts_created_at_idx on posts (created_at desc);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  is_anonymous boolean not null default true,
  content text not null,
  created_at timestamptz not null default now()
);
create index comments_post_id_idx on comments (post_id);

create table likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table bookmarks (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Mentors
-- ---------------------------------------------------------------------------
create table mentor_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  headline text,
  badges text[] not null default '{}',
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table mentor_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Messaging / notifications
-- ---------------------------------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_receiver_idx on messages (receiver_id, created_at desc);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Company matching
-- ---------------------------------------------------------------------------
create table companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  website text,
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  description text,
  location text,
  created_at timestamptz not null default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  status application_status not null default 'submitted',
  created_at timestamptz not null default now()
);

create table matching_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  status matching_status not null default 'pending',
  identity_revealed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Career tools
-- ---------------------------------------------------------------------------
create table resume_versions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  content text not null,
  language resume_language not null default 'en',
  created_at timestamptz not null default now()
);

create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  mode interview_mode not null default 'text',
  difficulty interview_difficulty not null default 'medium',
  questions jsonb not null default '[]',
  scores jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table ai_chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null, -- 'user' | 'assistant' | 'system'
  content text not null,
  function_type ai_function_type,
  language text not null default 'en',
  created_at timestamptz not null default now()
);
create index ai_chat_history_user_idx on ai_chat_history (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Platform-level settings
-- ---------------------------------------------------------------------------
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into settings (key, value) values
  ('allowed_university_email_domains', '["ac.jp", "edu"]'::jsonb);

-- ---------------------------------------------------------------------------
-- Auto-provision profile + accessibility prefs on signup
-- ---------------------------------------------------------------------------
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, university_email)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Anonymous'), new.email);

  insert into public.accessibility_preferences (profile_id) values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- updated_at maintenance
create function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute procedure set_updated_at();
create trigger posts_set_updated_at before update on posts
  for each row execute procedure set_updated_at();
