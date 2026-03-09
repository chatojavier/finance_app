# finance_app

Base project for a personal finance web app using Next.js + TypeScript + Tailwind.

## Requirements

- Node.js 24+
- pnpm 10+
- Docker Desktop
- Supabase CLI

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Supabase Local Setup (DEV-002)

1. Initialize Supabase in the repo (first time only):

```bash
supabase init
```

2. Start the local Supabase stack:

```bash
pnpm supabase:start
pnpm supabase:status
```

3. Create local env file:

```bash
cp .env.example .env.local
```

4. Set values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: local API URL shown by `supabase status`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: local anon key shown by `supabase status`

5. Run app and verify Supabase smoke health:

```bash
pnpm dev
```

Visit `http://localhost:3000/api/health/supabase`.

- Expected success: `{ "status": "ok" }`
- If env vars are missing or Supabase is down, endpoint returns `500` with an error message.

## Quality Commands

```bash
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
pnpm test
pnpm test:e2e
pnpm check
pnpm supabase:start
pnpm supabase:status
pnpm supabase:stop
```

## Git Hooks (Husky)

This repo configures a `pre-commit` hook that runs:

- `pnpm lint-staged`
- `pnpm typecheck`

If hooks are missing, run:

```bash
pnpm prepare
```

## Base Folder Structure

- `src/app`: Next.js App Router routes and layouts
- `src/components`: Shared UI components
- `src/features`: Domain modules/features
- `src/lib`: Shared utilities
- `src/server`: Server-side/BFF helpers
- `src/types`: Shared TypeScript types
- `src/config`: App constants/configuration
- `src/styles`: Global styles
- `tests/e2e`: Playwright end-to-end tests

## Scope of DEV-001

Included in this ticket:

- Next.js + TypeScript + Tailwind setup
- ESLint + Prettier + strict TypeScript
- Husky + lint-staged pre-commit gate
- Vitest + Playwright bootstrap with smoke tests
- Base project structure

Out of scope for this ticket:

- Supabase integration
- Authentication
- Data model / RLS
- Financial domain logic

## Scope of DEV-002

Included in this ticket:

- Supabase local integration and env convention
- Base clients for browser/server usage in App Router
- Technical smoke check endpoint for Supabase connectivity

Out of scope for this ticket:

- Auth screens and flows
- Data model tables/migrations
- RLS policies

## Scope of DEV-003

Included in this ticket:

- Supabase Auth with email/password signup, login and logout
- Protected app routes plus auth/public route separation
- `src/proxy.ts` session refresh + early redirects for Next.js 16
- Server-side session guards in auth and protected layouts
- Private app skeleton routes aligned to `UX/app_skeleton.pen`

Out of scope for this ticket:

- Forgot password flow
- OAuth / MFA
- User profile persistence beyond Supabase Auth
- Domain features for accounts, transactions, categories or reports

## Auth Routing Notes

- Public routes: `/auth/login`, `/auth/signup`
- Private routes: `/`, `/accounts`, `/transactions`, `/categories`, `/transfers`, `/credit-card`, `/fx`, `/reports`
- `src/proxy.ts` refreshes Supabase session cookies and redirects:
  - anonymous users from private routes to `/auth/login`
  - authenticated users away from `/auth/*` to `/`
- Protected and auth layouts repeat the guard server-side to avoid relying only on `proxy`

## Scope of DEV-004

Included in this ticket:

- Initial Supabase migration for data model v0 (`profiles`, `currencies`, `accounts`, `categories`, `transactions`)
- Constraints and indexes for MVP queries and data integrity
- RLS policies for per-user ownership on protected tables
- Seed data for MVP currencies (`PEN`, `USD`, `EUR`, `BTC`)
- Verification scripts for schema, RLS isolation, and ownership checks

Out of scope for this ticket:

- Signup/onboarding UI changes to create profile records
- Auto profile creation trigger on `auth.users`
- Domain CRUD screens for accounts, categories, and transactions

DEV-004 artifacts:

- `supabase/migrations/20260308235900_dev004_model_v0_rls.sql`
- `supabase/seed.sql`
- `supabase/snippets/dev004_notes.sql`
- `supabase/snippets/dev004_verification.sql`

Validation commands:

```bash
pnpm supabase:start
supabase db reset
docker exec -i supabase_db_finance_app psql -v ON_ERROR_STOP=1 -U postgres -d postgres < supabase/snippets/dev004_verification.sql
supabase db lint
```

Remote deploy command:

```bash
supabase db push
```
