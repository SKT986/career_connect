# Career Connect

A psychologically safe career support platform for international, disabled, LGBTQ+, and isolated
students — anonymous community, mentor support, and an AI career assistant.

This is the MVP slice of a larger product spec: Landing → Auth → Anonymous Community Feed → AI
Career Assistant are fully implemented end-to-end. Mentor Community, AI Mock Interview, Company
Matching, Dashboard, Notifications, Profile, and Admin Analytics have real routes, nav entries, and
placeholder screens ready for the next build pass — see `plans/` in the project history for the
full roadmap and database design rationale.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · Supabase
(Postgres, Auth, Storage) · Anthropic Claude via the Vercel AI SDK · pnpm

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run every migration
   against it (SQL Editor, in order — `0002` also creates the `avatars`/`post-images` storage
   buckets and their policies, so don't skip it):

   ```
   database/migrations/0001_init.sql
   database/migrations/0002_rls.sql
   database/migrations/0003_admin_mentor_verification.sql
   database/migrations/0004_notifications_realtime.sql
   database/migrations/0005_settings_preferences.sql
   database/migrations/0006_company_matching.sql
   database/migrations/0007_notifications_insert_policy.sql
   database/seed.sql
   ```

3. **Configure environment variables** — copy `.env.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL          # Project Settings → API
   NEXT_PUBLIC_SUPABASE_ANON_KEY     # Project Settings → API
   SUPABASE_SERVICE_ROLE_KEY         # Project Settings → API (server-only, not yet used by MVP code)
   ANTHROPIC_API_KEY                 # console.anthropic.com
   ANTHROPIC_MODEL                   # optional — defaults to claude-opus-4-8
   NEXT_PUBLIC_SITE_URL              # http://localhost:3000 in dev
   ```

4. **Configure allowed university email domains** — edit the `allowed_university_email_domains`
   row in the `settings` table (seeded with `["ac.jp", "edu"]`) to match your target schools.

5. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. **Push to GitHub** (already done for this repo) and [import the project into Vercel](https://vercel.com/new).
   Framework, install command (`pnpm install`), and build command (`pnpm build`) are all
   auto-detected — no `vercel.json` needed.
2. **Set environment variables** in the Vercel project's Settings → Environment Variables (same
   keys as `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (optional), and
   `NEXT_PUBLIC_SITE_URL` set to your production domain (e.g. `https://your-app.vercel.app`).
3. **Point Supabase at the production domain** — in the Supabase dashboard, Authentication → URL
   Configuration: set **Site URL** to your production `NEXT_PUBLIC_SITE_URL`, and add
   `https://your-app.vercel.app/auth/callback` (and any preview-deployment domains you use) to
   **Redirect URLs**. Without this, email verification and password-reset links will redirect to
   the wrong host.
4. **Know the rate-limiter's limitation**: `src/lib/rate-limit.ts` is an in-memory, per-instance
   limiter (see comment in that file). On Vercel's serverless runtime this means the AI
   chat/mock-interview rate limits aren't shared across concurrent function instances — fine for
   an initial launch, but swap it for a shared store (e.g. Upstash Redis) before real traffic makes
   that matter.
5. **Redeploy after any migration change** — Vercel deploys are stateless; database migrations are
   applied separately via the Supabase SQL Editor (step 2 in Setup above), not by the build.

## Project structure

```
src/
  app/            Route groups: (marketing), (auth), (app) — see inline layout files
  components/     ui/ (shadcn primitives), feed/, ai/, layout/, shared/
  hooks/          useAccessibility, etc.
  services/       Data access + Server Actions (postsService, postsActions, authService, aiService)
  lib/            Supabase clients, Claude model config, nav config, formatting helpers
  types/          database.types.ts (hand-authored, see note below), domain.ts
database/
  migrations/     Full normalized schema + RLS policies
  seed.sql
```

### Regenerating database types

`src/types/database.types.ts` is hand-written to match the SQL migrations. Once your Supabase
project has the schema applied, you can regenerate it from the Supabase CLI:

```bash
supabase gen types typescript --linked > src/types/database.types.ts
```

If you do, keep every table's `Row`/`Insert`/`Update` as `type` aliases, not `interface`s —
`@supabase/postgrest-js`'s select-string parser silently resolves to `never` for named interfaces
in this dependency combination, which was the cause of several build errors during development.

## Scripts

```bash
pnpm dev      # start dev server
pnpm build    # production build (also type-checks + lints)
pnpm lint     # eslint only
```

## Security notes

- Row Level Security is enabled on every table (`database/migrations/0002_rls.sql`); anonymous
  posts hide the real author both at the RLS layer (company/matching tables) and the app layer
  (feed/comments resolve a display label server-side, never shipping the real profile to the
  client for anonymous content).
- The AI chat route (`/api/ai/chat`) applies a best-effort in-memory rate limit
  (20 requests / 5 minutes per user). Replace with a shared store (Upstash Redis, etc.) before
  running more than one server instance.
- Post images upload through `/api/upload`, which validates file type/size server-side and stores
  objects in a private Supabase Storage bucket behind a signed URL.
