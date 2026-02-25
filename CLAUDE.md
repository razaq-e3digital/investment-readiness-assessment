# CLAUDE.md — E3 Digital Investor Readiness Assessment

See the full project CLAUDE.md one directory up (`../CLAUDE.md`) for complete documentation.

This file exists so Claude Code sessions launched from inside this repo directory automatically load project context.

## Quick Reference

**Stack:** Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · Clerk · Drizzle ORM · PostgreSQL (Railway) · Sentry (EU) · OpenRouter AI

**PRDs:** `docs/prds/phase-0-boilerplate-setup.md` through `phase-8-polish-testing-launch.md`

---

## Critical Gotchas (read before touching anything)

### File paths differ from CLAUDE.md planned structure
| CLAUDE.md says | Actual path |
|---|---|
| `src/lib/env.ts` | `src/libs/Env.ts` (capital E) |
| `src/lib/db/schema.ts` | `src/models/Schema.ts` |
| `src/lib/db/queries/` | Does not exist yet — create in Phase 3+ |

### ClerkProvider is NOT in the root layout
It lives in `src/app/(auth)/layout.tsx`. Public routes (`/`, `/results/[id]`) must never import Clerk. Moving ClerkProvider to root layout breaks static page generation in CI.

### Database commands need explicit env loading
```bash
npm run db:push      # ✅ loads .env.local automatically
drizzle-kit push     # ❌ will fail — DATABASE_URL not found
```

### Semgrep on Windows
```bash
python -m semgrep --config=auto src/ --error   # ✅
npx semgrep ...                                 # ❌ not available via npx
```

### commitlint enforces lowercase subjects
```
feat(scope): lowercase description    ✅
feat(scope): Uppercase Description    ❌ — husky will reject
```

### Staging secrets safely
```bash
git add -A && git reset HEAD .env.local
```

### Railway has two DATABASE_URLs
- **Local dev / migrations:** external URL (`caboose.proxy.rlwy.net:35920`)
- **Railway deployment:** internal URL (`postgres.railway.internal:5432`) — set this in Railway dashboard

---

## Post-Implementation Workflow (mandatory after every feature)

```bash
npm run build
npm run lint && npm run check-types    # note: check-types not type-check
python -m semgrep --config=auto src/ --error
npm run test
git checkout -b feature/<name>
git add -A && git reset HEAD .env.local
git commit -m "feat(scope): lowercase description"
git push origin feature/<name>
gh pr create ...
```

---

## Phase Status

| Phase | Status | Branch |
|-------|--------|--------|
| 0 — Boilerplate Setup | ✅ Complete | `feature/phase-0-boilerplate-setup` (PR #2) |
| 1 — Landing Page | Pending | — |
| 2 — Assessment Form | Pending | — |
| 3 — Submission & AI Scoring | Pending | — |
| 4 — Results Page | Pending | — |
| 5 — Email Delivery | Pending | — |
| 6 — Brevo CRM Sync | Pending | — |
| 7 — Admin Dashboard | Pending | — |
| 8 — Polish, Testing & Launch | Pending | — |
