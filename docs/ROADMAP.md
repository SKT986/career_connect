# Career Connect — Roadmap

This is the original build plan for the MVP, kept as a reference for extending the app. The
sections below describe what was planned; see the **Status** note at the top for what's actually
shipped versus still open.

## Status (current)

**Shipped and verified against a live Supabase project, using Anthropic Claude for the AI Assistant (migrated from OpenAI):**
- Landing, Register/Login (university email + Google/GitHub OAuth), email verification gate,
  self-service password reset (`/forgot-password` → `/set-password`, handles both admin-generated
  invite links and user-initiated recovery links)
- Anonymous Community Feed: posts, comments, likes, bookmarks, search, category filters, image upload
- Post Detail page with threaded replies, including mentor-badged non-anonymous replies
- Mentor Community (`/mentors`): verified mentor directory, self-service mentor headline/profile,
  AMA session hosting + upcoming-sessions list, mentor success-story posts pulled from the feed
- AI Career Assistant: streaming chat, 8 functions, EN/JP language support
- AI Mock Interview (`/mock-interview`): AI-generated question sets at 3 difficulty levels, text mode
  and voice mode (Web Speech API — question read aloud, spoken answers transcribed in supported
  browsers, graceful fallback to typing elsewhere), structured per-answer scoring with strengths/
  improvements, session results summary, all persisted to `interview_sessions`
- Admin Analytics (`/admin`, admin-role-gated): KPI cards (total/new users, posts, comments,
  verified mentors, pending verifications), 14-day daily-active-users and post/comment-volume
  trend charts, popular-topics breakdown (Recharts), a mentor verification queue, a
  promote-student-to-mentor search, and company account creation (service-role-provisioned invite,
  see `services/adminActions.ts`) — all backed by `services/adminService.ts` / `adminActions.ts`
- Student Dashboard (`/dashboard`): saved posts, mock interview score history, resume versions,
  and an AI Assistant usage breakdown by function — all pulling from data the other shipped
  features already produce
- Notification System (`/notifications`): real-time (Supabase Realtime) in-app notifications for
  replies, mentor comments, and company reveal requests, topbar unread-count bell, mark-as-read /
  mark-all-read (`database/migrations/0004_notifications_realtime.sql` and
  `0007_notifications_insert_policy.sql` — the latter fixes a real bug where the original RLS only
  allowed a user to insert a notification for *themselves*, silently dropping every notification
  since they're always created by someone else; caught during two-real-account Company Matching testing)
- Profile (`/profile`): editable display name, bio, and avatar (`avatars` storage bucket)
- Settings (`/settings`): "post anonymously by default" and notification opt-out preferences
  (wired into the post/comment composers and the notification triggers), password change, sign out
  (`database/migrations/0005_settings_preferences.sql`)
- Company Matching (`/companies`): admin-provisioned company accounts (service-role invite), a job
  board where students browse and apply anonymously, and consent-based identity reveal via
  `matching_requests` (company requests → student accepts/declines → company sees real name only
  on accept), tied into the notification system
  (`database/migrations/0006_company_matching.sql`) — verified live end-to-end with two real accounts
- Full app shell (sidebar/topbar nav, dark mode, high contrast, large text, language selector)
- Full 18-table normalized schema with RLS on every table, migrated and live

Every route from the original placeholder list now has real feature logic behind it.

Mentor promotion and verification are handled from `/admin` (see
`database/migrations/0003_admin_mentor_verification.sql` for the RLS policy that unblocked
admin writes to `mentor_profiles`). A mentor who isn't yet verified can still set up their
profile from `/mentors`, but won't appear in the public directory until an admin verifies them.

---

## Original build plan

### Context
Career Connect is a greenfield, empty-directory project (`/Users/apple/Desktop/mynavi`, no git repo yet). The full spec covers 14 DB tables, 14 pages, real-time notifications, voice-mode mock interviews, i18n, and admin analytics — realistically weeks of work. Per user decision, this pass delivers:
- **Full architecture, DB schema, and design system** (spec steps 1–8) so nothing downstream needs to be re-architected later.
- **A narrow, fully-working MVP slice**: Landing → Auth (Supabase, university email + Google + GitHub, email verification) → Anonymous Community Feed (posts/comments/likes/bookmarks/search/categories/image upload) → AI Career Assistant (streaming GPT chat: resume feedback, interview practice, career advice, job recs, strength/weakness analysis, STAR answers, cover letters, EN/JP).
- **Every other page** (Mentor, Mock Interview, Company Search, Dashboard, Settings, Accessibility Settings, Notifications, Profile, Admin) gets a real route, real layout/nav entry, and a polished "coming soon" placeholder — so the app shell is complete and future feature work drops into an existing slot rather than requiring restructuring.

User has Supabase + OpenAI credentials ready and will paste them into `.env.local` when I scaffold the project (I will not ask them to paste secrets into chat).

### Tech decisions
- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- pnpm, single app (not a monorepo)
- Supabase (Postgres, Auth, Storage, Realtime) via `@supabase/ssr` for server/client/middleware clients
- OpenAI SDK (GPT-4.1, streaming) via a Next.js Route Handler (`/api/ai/chat`) using the AI SDK (`ai` package + `@ai-sdk/openai`) for streaming + tool-call structure
- Mutations via Next.js Server Actions where possible (create post, like, comment, bookmark); AI chat via streaming Route Handler
- next-intl for EN/JP (Easy Japanese as a third locale variant, stubbed for later)

### Folder structure
```
mynavi/
  src/
    app/
      (marketing)/page.tsx                 # Landing
      (auth)/login/page.tsx
      (auth)/register/page.tsx
      (auth)/callback/route.ts             # OAuth + email verification callback
      (app)/layout.tsx                     # authenticated shell: sidebar/topbar, a11y toggles
      (app)/feed/page.tsx                  # Home Feed
      (app)/feed/[postId]/page.tsx         # Post Detail
      (app)/mentors/page.tsx               # placeholder
      (app)/ai-assistant/page.tsx          # AI Career Assistant
      (app)/mock-interview/page.tsx        # placeholder
      (app)/companies/page.tsx             # placeholder
      (app)/dashboard/page.tsx             # placeholder
      (app)/settings/page.tsx              # placeholder
      (app)/accessibility/page.tsx         # placeholder (dark mode/font size DO work globally)
      (app)/notifications/page.tsx         # placeholder
      (app)/profile/page.tsx               # placeholder
      (admin)/admin/page.tsx               # placeholder
      api/ai/chat/route.ts                 # streaming OpenAI endpoint
      api/upload/route.ts                  # signed upload URL for post images
    components/
      ui/                                  # shadcn primitives
      feed/                                # PostCard, PostComposer, CommentList, CategoryFilter
      ai/                                  # ChatWindow, MessageBubble, FunctionPicker
      layout/                              # Sidebar, Topbar, AccessibilityToggle
      shared/                              # EmptyState, ComingSoon, AnonymousAvatar
    hooks/                                 # useAuth, usePosts, useChat, useAccessibilityPrefs
    services/                              # postsService, aiService, storageService (pure fns wrapping supabase/openai calls)
    lib/
      supabase/{client.ts,server.ts,middleware.ts}
      openai.ts
      utils.ts
    types/                                 # database.types.ts (generated), domain.ts
    middleware.ts                          # session refresh + route protection
  database/
    migrations/0001_init.sql               # full schema
    migrations/0002_rls.sql                # RLS policies
    seed.sql
  .env.example
```

### Database schema (full, per spec — all 14+ tables now, MVP wires up a subset)
Core identity: `profiles` (1:1 with `auth.users`, role enum: student/mentor/company/admin, university_email, verified_at, display_name, avatar_url), `accessibility_preferences` (1:1 profiles: dark_mode, font_scale, high_contrast, language).

Community (MVP-active): `posts` (author_id→profiles, is_anonymous, category enum, content, image_url, created_at), `comments` (post_id, author_id, content), `likes` (post_id, user_id, unique), `bookmarks` (post_id, user_id, unique).

Mentor: `mentor_profiles` (profiles 1:1, bio, badges[], verified), `mentor_sessions` (AMA sessions: mentor_id, title, scheduled_at).

Messaging/notifications: `messages` (sender_id, receiver_id, body), `notifications` (user_id, type, payload jsonb, read_at).

Company matching: `companies` (owner profile, name, description), `jobs` (company_id, title, description), `applications` (job_id, student_id, status), `matching_requests` (student_id, company_id, status, revealed boolean).

Career tools: `resume_versions` (student_id, title, content, language), `interview_sessions` (student_id, mode, difficulty, questions jsonb, scores jsonb), `ai_chat_history` (user_id, role, content, function_type, language, created_at).

`settings` (key/value app config, admin-editable).

All tables: `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`. RLS enabled on every table; posts/comments readable by all authenticated users but author identity hidden at the app layer (anonymous display name derived, not the real profile) for non-mentor/non-admin roles; owners can update/delete their own rows; company tables only readable by their own `companies.owner_id` and matched students; admin bypass via role check.

### UI design system
- Palette: soft indigo/teal primary (`--primary: #6C63FF`-ish), warm neutral background, semantic tokens for light/dark via CSS variables + `data-theme` attribute (shadcn convention) — high-contrast mode as a third `data-contrast="high"` attribute that boosts token contrast, not a separate theme.
- Rounded-2xl cards, soft shadows, Inter/system font stack, generous whitespace — Notion/Linear-inspired calm density; Discord-style sidebar nav; Reddit-style feed card rhythm.
- Framer Motion: shared layout transitions for feed cards, fade/slide for route transitions, respects `prefers-reduced-motion`.
- Accessibility baked into primitives from the start: visible focus rings, skip-to-content link, `font-scale` CSS variable multiplier, semantic landmarks, aria-live region for AI chat streaming.

### Auth flow
1. Register: email/password (validate university domain via regex/allowlist stored in `settings`) or Google/GitHub OAuth.
2. Supabase sends verification email; `profiles.verified_at` set via webhook/callback route once confirmed; unverified users see a "verify your email" gate on `(app)` routes.
3. `middleware.ts` refreshes session and redirects unauthenticated users from `(app)`/`(admin)` to `/login`, and redirects unverified users to a verify-email screen.
4. On first login, a Postgres trigger (`handle_new_user`) inserts a `profiles` row with role='student' default and a matching `accessibility_preferences` row.

### API surface (MVP)
- Server Actions: `createPost`, `toggleLike`, `toggleBookmark`, `createComment`, `searchPosts` (in `services/postsService.ts`, called from feed components)
- `POST /api/ai/chat` — streaming, accepts `{messages, functionType, language}`, calls OpenAI via `services/aiService.ts`, persists to `ai_chat_history`
- `POST /api/upload` — returns a Supabase Storage signed upload URL for post images (bucket `post-images`)

### Implementation order
1. Scaffold: `create-next-app` (TS, Tailwind, App Router), pnpm, shadcn/ui init, Framer Motion, ESLint/Prettier, `.env.example`
2. `lib/supabase/*`, `middleware.ts`, `types/database.types.ts` placeholder (regenerate once schema is live)
3. `database/migrations/0001_init.sql` + `0002_rls.sql` + `seed.sql` (full schema above)
4. Design tokens: `globals.css` variables, Tailwind theme extension, shadcn components install (button, card, input, dialog, dropdown-menu, avatar, badge, tabs, toast, skeleton)
5. Layout shell: Sidebar/Topbar with all 14 nav entries, dark mode + font-scale + high-contrast toggles wired to `accessibility_preferences`
6. Auth pages: Login, Register, OAuth callback, verify-email gate
7. Landing page
8. Feed: PostCard, PostComposer (with image upload + category tag), CategoryFilter, search, comments, like/bookmark
9. Post Detail page
10. AI Career Assistant: ChatWindow + streaming route handler + function picker (resume feedback / interview practice / career advice / job rec / strength-weakness / STAR / cover letter) + EN/JP toggle
11. Placeholder pages for the remaining 9 routes (consistent `ComingSoon` component, real route + nav entry)
12. `.env.example`, README with setup steps (run migrations, set env vars, `pnpm dev`)

### Verification
- `pnpm dev`, use `Claude_Preview` browser tools to: register a new user, confirm email-verification gate, log in, toggle dark mode/font size, create a post with an image, like/comment/bookmark it, search/filter by category, open post detail, and run a real AI Assistant conversation (resume feedback + STAR answer) once the user's OpenAI key is in `.env.local`.
- Confirm RLS by checking a second (unverified or different-role) session cannot see another user's private data.
- `pnpm build` to confirm no type/build errors.
- Manually tab through the feed and chat with keyboard only to sanity-check focus order and skip-link.
