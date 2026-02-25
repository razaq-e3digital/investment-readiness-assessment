# PRD: Phase 0 — Boilerplate Setup & Configuration

## Overview

**Phase:** 0
**Title:** Boilerplate Setup & Configuration
**Goal:** Strip the ixartz SaaS boilerplate to essentials, configure core services, and deploy a working skeleton application.
**Priority:** Critical — foundation for all subsequent phases
**Estimated Effort:** 1–2 days

---

## Problem Statement

The project starts from the ixartz SaaS Boilerplate which includes many features not needed for the Investor Readiness Assessment Tool (i18n, multi-tenancy, billing/Stripe, marketing landing page copy). Building on top of unused code increases complexity, introduces dead code paths, and makes future debugging harder. We need a clean foundation with core infrastructure (auth, database, monitoring, CI/CD) properly configured before building any product features.

---

## Success Criteria (Definition of Done)

- [ ] App deploys to Railway at `assess.e3digital.net`
- [ ] Clerk login works (email/password + Google OAuth)
- [ ] PostgreSQL database connects via Railway
- [ ] Drizzle schema migration runs successfully with assessment tables
- [ ] Sentry captures a test error
- [ ] CI pipeline passes on push (build + lint + type-check + test)
- [ ] All unused boilerplate features removed

---

## Detailed Requirements

### 0.1 — Strip Boilerplate to Essentials

**What to remove:**
- **i18n / Internationalization:** Remove `next-intl`, all locale routing (`[locale]` segments), translation JSON files (`src/locales/`), language switcher components, Crowdin config. The app will be English-only.
- **Multi-tenancy / Organizations:** Remove Clerk organization features, organization schema table, organization switching UI, team member management pages, onboarding organization selection flow.
- **Billing / Stripe:** Remove Stripe dependencies, pricing page, subscription management, Stripe webhook handler, organization Stripe fields from schema, all billing-related API routes, pricing plan config.
- **Landing page marketing copy:** Remove the existing hero, features, sponsors, pricing, FAQ, and CTA sections (Phase 1 will rebuild these with E3 Digital branding).
- **Demo/example content:** Remove demo badge, sponsor logos, todo schema table, any example/sample data.
- **Storybook:** Remove Storybook configuration and dependencies (not needed for MVP).
- **Crowdin:** Remove Crowdin integration and config.
- **Percy visual testing:** Remove Percy integration (not needed for MVP).

**What to keep:**
- Next.js 14 App Router structure
- Clerk authentication (reconfigure in 0.2)
- Drizzle ORM (reconfigure in 0.3)
- Tailwind CSS + Shadcn UI components
- Sentry integration (reconfigure in 0.5)
- React Hook Form + Zod
- ESLint + Husky + lint-staged
- Vitest + Playwright test infrastructure
- GitHub Actions CI structure

**Technical notes:**
- After removing i18n, flatten route structure from `src/app/[locale]/` to `src/app/`
- Update `middleware.ts` to remove next-intl, keep only Clerk auth middleware
- Update `next.config.mjs` to remove next-intl plugin
- Clean up `package.json` — remove unused dependencies and run `npm install` to update lockfile

### 0.2 — Configure Clerk Authentication

**Requirements:**
- Email/password authentication enabled
- Google OAuth enabled
- Remove Facebook, Twitter, GitHub, Apple social logins (simplify)
- Remove MFA for now (can add later)
- Remove organization/multi-tenancy features from Clerk config
- Configure sign-in URL: `/sign-in`
- Configure sign-up URL: `/sign-up`
- Configure after-sign-in redirect: `/dashboard` (for returning users with accounts)
- Configure after-sign-up redirect: `/dashboard`
- Public routes: `/`, `/results/[id]`, `/api/assessment/submit`, `/api/webhooks/*`

**Environment variables required:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**MANUAL STEP:** Create Clerk application in Clerk Dashboard, enable email/password + Google OAuth, obtain API keys.

### 0.3 — Configure Drizzle ORM + Railway PostgreSQL

**Requirements:**
- Configure Drizzle to connect to Railway PostgreSQL
- Use `pg` driver (already in dependencies)
- Remove PGlite local database fallback (we want consistent PostgreSQL everywhere)
- Configure connection string via `DATABASE_URL` environment variable
- Add connection pooling configuration (max 10 connections)
- SSL required for Railway connection

**Environment variables required:**
```
DATABASE_URL=postgresql://user:password@host:port/dbname
```

**MANUAL STEP:** Create PostgreSQL database on Railway, obtain connection string.

### 0.4 — Run Drizzle Schema Migration

**New schema tables to create:**

```typescript
// assessments table
assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Contact info
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactCompany: text('contact_company'),
  contactLinkedin: text('contact_linkedin'),
  contactSource: text('contact_source'),
  // Assessment data
  responses: jsonb('responses').notNull(), // Full form responses as JSON
  // Scoring
  overallScore: integer('overall_score'), // 0-100
  readinessLevel: text('readiness_level'), // 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early'
  categoryScores: jsonb('category_scores'), // { category: score } for 10 categories
  topGaps: jsonb('top_gaps'), // Top 3 gap objects
  recommendations: jsonb('recommendations'), // AI-generated recommendations
  quickWins: jsonb('quick_wins'), // Quick win actions
  // AI processing
  aiScored: boolean('ai_scored').default(false),
  aiModel: text('ai_model'), // Which model scored this
  aiProcessingTimeMs: integer('ai_processing_time_ms'),
  // Status tracking
  emailSent: boolean('email_sent').default(false),
  brevoSynced: boolean('brevo_synced').default(false),
  booked: boolean('booked').default(false),
  bookedAt: timestamp('booked_at'),
  // Auth (optional)
  clerkUserId: text('clerk_user_id'), // If user creates account after assessment
  // Spam protection
  recaptchaScore: real('recaptcha_score'),
  ipHash: text('ip_hash'), // SHA-256 hashed IP
  // Timestamps
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// email_logs table
emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }).notNull(),
  messageId: text('message_id'), // Mailgun message ID
  status: text('status').notNull().default('pending'), // pending | sent | delivered | opened | clicked | failed | bounced
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  failedAt: timestamp('failed_at'),
  failureReason: text('failure_reason'),
  retryCount: integer('retry_count').default(0),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// analytics_events table
analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(), // 'assessment_started' | 'assessment_completed' | 'results_viewed' | 'cta_clicked' | 'email_opened'
  assessmentId: uuid('assessment_id').references(() => assessments.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata'), // Flexible event data
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// rate_limits table
rateLimits = pgTable('rate_limits', {
  id: serial('id').primaryKey(),
  ipHash: text('ip_hash').notNull(),
  action: text('action').notNull(), // 'assessment_submit'
  windowStart: timestamp('window_start').notNull(),
  count: integer('count').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Indexes:**
- `assessments`: index on `contact_email`, `readiness_level`, `created_at`, `clerk_user_id`
- `email_logs`: index on `assessment_id`, `status`
- `analytics_events`: index on `event_type`, `created_at`, `assessment_id`
- `rate_limits`: unique compound index on `ip_hash` + `action` + `window_start`

### 0.5 — Configure Sentry Error Monitoring

**Requirements:**
- Configure Sentry DSN for the project
- Enable source maps upload in production builds
- Configure error boundary for React components
- Set up performance monitoring (sample rate 0.1 for production)
- Tag errors with environment (development/staging/production)

**Environment variables required:**
```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=e3-digital
SENTRY_PROJECT=investment-readiness
```

**MANUAL STEP:** Create Sentry project, obtain DSN and auth token.

### 0.6 — Configure Environment Variables Validation

**Requirements:**
- Use `@t3-oss/env-nextjs` (already installed) with Zod schemas
- Update `src/libs/Env.ts` to validate all required environment variables
- Separate server-only and client (NEXT_PUBLIC_) variables
- App must fail to start if required variables are missing
- Include descriptive error messages for each missing variable

**Server variables to validate:**
```
CLERK_SECRET_KEY (required)
DATABASE_URL (required)
SENTRY_AUTH_TOKEN (optional, required in production)
```

**Client variables to validate:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (required)
NEXT_PUBLIC_CLERK_SIGN_IN_URL (required)
NEXT_PUBLIC_CLERK_SIGN_UP_URL (required)
NEXT_PUBLIC_SENTRY_DSN (optional)
```

### 0.7 — Deploy Skeleton to Railway

**Requirements:**
- Deploy Next.js app to Railway
- Configure custom domain: `assess.e3digital.net`
- Configure all environment variables on Railway
- Verify Clerk login works in production
- Verify database connects in production
- Verify Sentry captures errors in production

**MANUAL STEP:** Create Railway project, link GitHub repo, configure custom domain DNS, set environment variables.

### 0.8 — Set Up GitHub Actions CI Pipeline

**Requirements:**
- Trigger on: push to `main`, pull requests to `main`
- Steps: install dependencies → lint → type-check → build → test (unit)
- Use Node.js 20
- Cache npm dependencies
- Fail the pipeline on any step failure
- Add status badge to README

**Simplify from boilerplate:**
- Remove Codecov upload (not needed yet)
- Remove Percy visual testing step
- Remove Storybook build step
- Remove deployment steps (Railway auto-deploys from main)

---

## Dependencies

- **Upstream:** None (this is Phase 0)
- **Downstream:** All subsequent phases depend on this phase completing successfully

---

## Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing i18n breaks routing | High | Test all routes after removal, update all imports |
| Railway PostgreSQL connection issues | Medium | Test locally with Railway connection string first |
| Clerk config mismatch between environments | Medium | Use environment-specific Clerk apps (dev/prod) |
| Stripping too much from boilerplate | High | Commit before each removal step, test incrementally |

---

## Out of Scope

- Landing page design (Phase 1)
- Assessment form (Phase 2)
- Any user-facing features
- Email or CRM integrations
- Admin dashboard
