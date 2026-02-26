# CLAUDE.md — E3 Digital Investor Readiness Assessment

## Quick Reference

**Stack:** Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · Clerk · Drizzle ORM · PostgreSQL (Railway) · Sentry (EU) · OpenRouter AI

**Brand:** E3 Digital

**PRDs:** `docs/prds/phase-0-boilerplate-setup.md` through `phase-8-polish-testing-launch.md`

---

## Critical Gotchas (read before touching anything)

### File paths differ from boilerplate defaults
| Default / expected | Actual path |
|---|---|
| `src/lib/env.ts` | `src/libs/Env.ts` (capital E) |
| `src/lib/db/schema.ts` | `src/models/Schema.ts` |
| `src/lib/utils.ts` (`cn()`) | `src/utils/Helpers.ts` |
| `src/lib/db/queries/` | Does not exist yet — create in Phase 3+ |

### ClerkProvider is NOT in the root layout
It lives in `src/app/(auth)/layout.tsx`. Public routes (`/`, `/results/[id]`) must never import Clerk. Moving ClerkProvider to root layout breaks static page generation in CI.

### Database commands need explicit env loading
```bash
npm run db:push      # ✅ loads .env.local automatically
drizzle-kit push     # ❌ will fail — DATABASE_URL not found
```

### Railway has two DATABASE_URLs
- **Local dev / migrations:** external URL (`caboose.proxy.rlwy.net:35920`)
- **Railway deployment:** internal URL (`postgres.railway.internal:5432`) — set this in Railway dashboard

---

## Commit Conventions (CRITICAL)

This repo enforces **Conventional Commits** via commitlint + Husky.

**Format**: `type(scope): subject`

- `feat:` — new feature (triggers minor version bump via semantic-release)
- `fix:` — bug fix (triggers patch version bump)
- `docs:` — documentation only
- `chore:` — maintenance, config changes
- `test:` — adding or updating tests
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `style:` — formatting, whitespace (not CSS changes)

**Rules**:
- Subject MUST be lowercase — `feat: add login` not `feat: Add Login`
- Commit messages WITHOUT a type prefix will fail CI (`subject-empty`, `type-empty` errors)
- Footer lines (like URLs) must have a leading blank line or commitlint fails with `footer-leading-blank`
- CI validates ALL commits in a PR, not just the latest — every commit must pass
- Use `npm run commit` to get an interactive Commitizen prompt if unsure about format
- Don't manually bump `package.json` version — semantic-release handles it

---

## Git Workflow

### Always check for merge conflicts before pushing
Before pushing a branch or creating a PR, always rebase onto the latest target branch to resolve conflicts locally:
```bash
git fetch origin main
git rebase origin/main
# Resolve any conflicts, then:
git push -u origin <branch-name> --force-with-lease
```
This prevents PRs from having merge conflicts that block CI or require manual resolution in the GitHub UI. Catching conflicts early (locally) is far easier than resolving them later.

### Post-Implementation Workflow (mandatory after every feature)
```bash
npm run build
npm run lint && npm run check-types    # note: check-types not type-check
npm run test
git fetch origin main && git rebase origin/main   # ensure no conflicts
git checkout -b feature/<name>
git add -A && git reset HEAD .env.local            # never commit secrets
git commit -m "feat(scope): lowercase description"
git push -u origin feature/<name>
```

### Staging secrets safely
```bash
git add -A && git reset HEAD .env.local
```

---

## Linting & Code Style

- **ESLint** handles ALL formatting (Prettier is disabled)
- Config: `eslint.config.mjs` based on `@antfu/eslint-config`
- Semicolons: **required**
- Brace style: **1tbs** (One True Brace Style)
- Use `type` keyword, not `interface`, for TypeScript type definitions
- Import sorting via `simple-import-sort` (auto-fixed on save/commit)
- Lint-staged runs ESLint + type-check on commit (sequential via `--concurrent false`)
- Path aliases: `@/*` → `./src/*`, `@/public/*` → `./public/*`
- TypeScript strict mode: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters` all enabled

---

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Shadcn UI components (install via: npx shadcn-ui add <component>)
├── features/     # Feature modules (business logic)
├── hooks/        # Custom React hooks
├── libs/         # Library utilities (Clerk, DB client, Env)
├── locales/      # i18n translation JSON files (next-intl)
├── models/       # Drizzle ORM schemas
├── styles/       # Global CSS
├── templates/    # Page layout templates
├── types/        # Shared TypeScript types
└── utils/        # Utility functions (Helpers.ts for Shadcn cn())

docs/
├── prds/         # Phase-based PRDs (phase-0 through phase-8)
└── RalphWiggumPrompts.md  # Implementation prompts (RalphWiggum + Claude Code Interactive)
```

---

## Phase Architecture

The application is built in 9 incremental phases:

| Phase | Name | Status |
|-------|------|--------|
| 0 | Boilerplate Setup | ✅ Complete (PR #2) |
| 1 | Landing Page & Design System | Pending |
| 2 | Assessment Form | Pending |
| 3 | Submission & AI Scoring | Pending |
| 4 | Results Page | Pending |
| 5 | Email Delivery | Pending |
| 6 | Brevo CRM Sync | Pending |
| 7 | Admin Dashboard | Pending |
| 8 | Polish, Testing & Launch | Pending |

Each PRD lives in `docs/prds/phase-N-*.md`. Implementation prompts are in `docs/RalphWiggumPrompts.md`.

### RalphWiggum vs Claude Code Interactive Prompts

Two prompt types exist in `docs/RalphWiggumPrompts.md`:

1. **RalphWiggum prompts** — For the RalphWiggum plugin (automated PRD-to-code). Use `@ralphwiggum implement docs/prds/phase-N-*.md` syntax.
2. **Claude Code Interactive prompts** — For Claude Code sessions (conversational, with manual pause points). Use these if RalphWiggum is not available.

Both reference the same PRDs. Always implement phases in order (0 → 1 → 2 → ...).

---

## Design System (from Stitch Mockups)

The design system is fully specified in `docs/prds/phase-1-landing-page.md` Section 1.1. Key tokens:

- **Primary Navy**: `#0f172a` (dark sections, admin sidebar)
- **Accent Blue**: `#2563eb` (buttons, links, selected states)
- **Background**: `#f8fafc` (page bg), `#f1f5f9` (processing screen bg)
- **CTA Green**: `#10b981` (final CTA buttons on results page)
- **Score Colors**: Green `#22c55e` (75-100), Blue `#3b82f6` (60-74), Orange `#f97316` (40-59), Red `#ef4444` (0-39)
- **Font**: Inter (400/500/600/700)
- **Cards**: White bg, `rounded-xl`, `shadow-sm`, `border border-slate-200`

Design specs live in PRDs — always reference the PRD for exact colours, spacing, and component structures rather than improvising.

---

## Testing Commands

```bash
npm run test          # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run check-types   # TypeScript strict type checking
npm run build         # Next.js production build
```

## CI Pipeline

GitHub Actions (`.github/workflows/CI.yml`) runs on PRs to main:
- Build (Node 20.x + 22.6 matrix)
- ESLint + type-check
- Unit tests with coverage
- Storybook tests
- E2E tests (Chromium always, Firefox in CI)
- **Commitlint validation on all PR commits**
- Crowdin i18n sync

---

## Additional Gotchas

1. **Drizzle not Prisma** — This project uses Drizzle ORM, not Prisma. Schema in `src/models/Schema.ts`.

2. **i18n is required** — All user-facing strings should go through next-intl. Translation files are in `src/locales/`.

3. **Semgrep on Windows** — Use `python -m semgrep --config=auto src/ --error` (not available via npx).

4. **`npm install` may not be run in CI environments** — Node modules might not be installed. Commitlint/ESLint won't run locally without them. CI is the final gatekeeper.

5. **Pre-commit hooks run sequentially** — lint-staged is configured with `--concurrent false` so type-checking runs after ESLint fixes are applied.
