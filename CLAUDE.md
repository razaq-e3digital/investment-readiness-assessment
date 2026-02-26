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
- **Body lines must be ≤ 100 characters** — commitlint enforces `body-max-line-length`. Long bullet points in the body will fail. Wrap lines or keep them short.
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

### ESLint rules that bite in practice (Phase 1 discoveries)

**`style/jsx-one-expression-per-line`** — When mixing inline elements (`<strong>`, `<Link>`, `<a>`) with surrounding text, each element AND each adjacent text node must be on its own line, with `{' '}` spacers. Auto-fixed by `npm run lint:fix` but generates many errors upfront. Example:
```tsx
// ❌ fails
<p>Contact us at <a href="...">email</a>.</p>

// ✅ passes
<p>
  Contact us at
  {' '}
  <a href="...">email</a>
  .
</p>
```

**`tailwindcss/enforces-shorthand`** — Tailwind shorthand must be used when available. Common traps:
- `left-0 right-0` → `inset-x-0`
- `top-0 bottom-0` → `inset-y-0`
- `h-full w-full` → `size-full`
- `px-4 py-4` → `p-4` (only when both values are equal)
- Auto-fixed by `npm run lint:fix`.

**`curly`** — All `if` statements must use braces, even single-line. `if (x) return;` → `if (x) { return; }`. Auto-fixable.

**`react/no-array-index-key`** — Never use array index as React `key`. Use a stable unique property from the data instead.

**`react-refresh/only-export-components`** — A file that exports a React component must ONLY export that component. Exporting a utility function alongside a component causes this warning and breaks Fast Refresh. **Fix:** move utility functions to their own file in `src/utils/`. Example: `trackEvent` lives in `src/utils/analytics.ts`, not in `GoogleAnalytics.tsx`.

**`ts/consistent-type-definitions: type`** — Use `type` not `interface`. Exception: `declare global { interface Window ... }` augmentations cannot use `type` — add `// eslint-disable-next-line ts/consistent-type-definitions` above them (see `src/types/global.d.ts` for examples).

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
| 1 | Landing Page & Design System | ✅ Complete (PR #4) |
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

## Design System (implemented in Phase 1)

Tokens are **live in `tailwind.config.ts`** as of Phase 1. Use these class names directly — do NOT use raw hex values in new code.

| Token class | Hex | Usage |
|---|---|---|
| `bg-navy` / `text-navy` | `#0f172a` | Hero, FinalCTA, Footer, admin sidebar |
| `bg-navy-light` | `#1e293b` | Gradient end on dark sections |
| `bg-accent-blue` | `#2563eb` | Primary CTA buttons, links |
| `hover:bg-accent-blue-hover` | `#1d4ed8` | Button hover state |
| `bg-accent-blue-light` | `#dbeafe` | Badges, info tint backgrounds |
| `bg-cta-green` | `#10b981` | Secondary CTA (Book Strategy Call) |
| `bg-page-bg` | `#f8fafc` | Light section backgrounds |
| `bg-card-border` | `#e2e8f0` | Card borders, dividers |
| `text-text-primary` | `#0f172a` | Headings |
| `text-text-secondary` | `#475569` | Body text |
| `text-text-muted` | `#94a3b8` | Helper text, timestamps |
| `text-score-green` + `bg-score-green-bg` | `#22c55e` / `#dcfce7` | Score 75–100 |
| `text-score-blue` + `bg-score-blue-bg` | `#3b82f6` / `#dbeafe` | Score 60–74 |
| `text-score-orange` + `bg-score-orange-bg` | `#f97316` / `#ffedd5` | Score 40–59 |
| `text-score-red` + `bg-score-red-bg` | `#ef4444` / `#fee2e2` | Score 0–39 |

**Font:** Inter via `next/font/google` with CSS variable `--font-inter`. Applied via `font-sans` class (configured in tailwind). Do not add a separate `<link>` for Inter.

**Cards:** `rounded-xl border border-card-border bg-white shadow-card` — use `shadow-card` not `shadow-sm`.

**Buttons — primary:** `bg-accent-blue hover:bg-accent-blue-hover rounded-lg px-6 py-3 text-base font-semibold text-white`

Full spec in `docs/prds/phase-1-landing-page.md` Section 1.1.

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

2. **i18n was removed in Phase 0** — `next-intl` was stripped out. Do NOT route strings through next-intl. Write user-facing strings directly in components. The old boilerplate `src/locales/` directory no longer exists.

3. **Semgrep on Windows — broken as of v1.151.0** — Multiple approaches fail:
   - `python -m semgrep` — deprecated as of v1.38.0, exits with deprecation error
   - `semgrep` / `npx semgrep` — not on PATH
   - `pysemgrep.exe --config=auto` — fails with `UnicodeEncodeError: 'charmap' codec can't encode character '\u202a'` (Windows cp1252 encoding bug when writing downloaded rules to a temp file)

   **Workaround:** Set `PYTHONUTF8=1` before running:
   ```bash
   PYTHONUTF8=1 "C:/Users/Razaq/AppData/Roaming/Python/Python313/Scripts/pysemgrep.exe" --config=auto src/ --error
   ```
   If that still fails, semgrep CI will catch issues. Note this in the PR rather than skipping silently.

4. **`npm run build` takes 60–90 seconds** — When running build in a Claude Code session, use `run_in_background: true` or add a long timeout (120s+). A 30s timeout will falsely appear to hang. The build output shows `✓ Compiled successfully` before lint/type phases, so partial output does not mean success.

5. **`npm install` may not be run in CI environments** — Node modules might not be installed. Commitlint/ESLint won't run locally without them. CI is the final gatekeeper.

6. **Pre-commit hooks run sequentially** — lint-staged is configured with `--concurrent false` so type-checking runs after ESLint fixes are applied.

7. **Analytics** — GA4 Measurement ID is `G-P59WC8HKVK`, set in `.env` (committed — it's a public value). Use `trackEvent()` from `src/utils/analytics.ts` for custom events. Cookie consent key in localStorage is `'cookie-consent'` (values: `'accepted'` | `'declined'`). Consent change triggers `window.dispatchEvent(new Event('cookie-consent-change'))`.

8. **Public env file is `.env`, secrets in `.env.local`** — `.env` is committed to git (contains `NEXT_PUBLIC_*` and non-secret config). `.env.local` is gitignored (contains `CLERK_SECRET_KEY`, `DATABASE_URL`, etc.). The staging pattern `git add -A && git reset HEAD .env.local` only protects `.env.local` — never put secrets in `.env`.
