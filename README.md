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

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run the migrations
   against it (SQL Editor, in order):

   ```
   database/migrations/0001_init.sql
   database/migrations/0002_rls.sql
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

4. **Enable OAuth providers** (optional) in Supabase → Authentication → Providers: Google and
   GitHub. Set each provider's redirect URL to `${NEXT_PUBLIC_SITE_URL}/auth/callback`.

5. **Configure allowed university email domains** — edit the `allowed_university_email_domains`
   row in the `settings` table (seeded with `["ac.jp", "edu"]`) to match your target schools.

6. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

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
