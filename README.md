# finance_app

Base project for a personal finance web app using Next.js + TypeScript + Tailwind.

## Requirements

- Node.js 24+
- pnpm 10+

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality Commands

```bash
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
pnpm test
pnpm test:e2e
pnpm check
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
