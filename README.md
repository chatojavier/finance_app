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
