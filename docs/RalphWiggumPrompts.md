# RalphWiggum Implementation Prompts

> **Plugin:** RalphWiggum — Automated PRD-to-code implementation
> **Project:** Investor Readiness Assessment Tool
> **PRD Location:** `docs/prds/`

This file contains the sequenced prompts for implementing each phase of the Investor Readiness Assessment Tool. Phases are designed to be executed in order — each builds on the previous one.

For phases with **manual steps** (external service setup, API key configuration, DNS, etc.), a separate **Claude Code Interactive Prompt** is provided that will pause execution, ask the user to complete the manual action, and continue with code generation in the background.

---

## Table of Contents

1. [Phase 0: Boilerplate Setup & Configuration](#phase-0-boilerplate-setup--configuration)
2. [Phase 1: Landing Page](#phase-1-landing-page)
3. [Phase 2: Assessment Form (Core)](#phase-2-assessment-form-core)
4. [Phase 3: Assessment Submission & AI Scoring](#phase-3-assessment-submission--ai-scoring)
5. [Phase 4: Results Page](#phase-4-results-page)
6. [Phase 5: Email Delivery (Mailgun)](#phase-5-email-delivery-mailgun)
7. [Phase 6: Brevo CRM Sync](#phase-6-brevo-crm-sync)
8. [Phase 7: Admin Dashboard](#phase-7-admin-dashboard)
9. [Phase 8: Polish, Testing & Pre-Launch](#phase-8-polish-testing--pre-launch)

---

## Phase 0: Boilerplate Setup & Configuration

### RalphWiggum Prompt — Phase 0

```
@ralphwiggum implement docs/prds/phase-0-boilerplate-setup.md

Context: This is a fresh ixartz SaaS Boilerplate (v1.7.7). We need to strip it down to essentials and configure core infrastructure.

Execute the following tasks in order:

TASK 0.1 — Strip Boilerplate:
- Remove next-intl and all i18n: delete src/locales/, remove [locale] route segments, flatten src/app/[locale]/ to src/app/, remove language switcher, remove next-intl from middleware.ts and next.config.mjs, uninstall next-intl and @crowdin/ota-client
- Remove multi-tenancy: delete organization schema, remove organization pages (dashboard/organization-profile/), remove onboarding/organization-selection, remove Clerk organization imports
- Remove Stripe/billing: delete pricing page, remove stripe dependencies, remove organization Stripe fields from schema, remove billing API routes, remove pricing config from AppConfig
- Remove landing page template content: remove existing Hero, Features, Sponsors, Pricing, FAQ, CTA templates (Phase 1 rebuilds these)
- Remove Storybook: delete .storybook/, remove storybook dependencies
- Remove Percy: remove @percy dependencies and visual test
- Remove Crowdin: delete crowdin.yml
- Remove todo schema table
- Clean package.json and run npm install
- Verify build passes after all removals

TASK 0.2 — Configure Clerk:
- Update middleware.ts for Clerk-only auth (no next-intl)
- Set public routes: /, /results/:id, /api/assessment/submit, /api/webhooks/:path*
- Update sign-in and sign-up pages (remove locale wrapper)
- Configure redirects: after sign-in → /dashboard, after sign-up → /dashboard
- PAUSE: Ask user for Clerk API keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)

TASK 0.3 — Configure Drizzle + PostgreSQL:
- Update drizzle.config.ts for PostgreSQL connection
- Remove PGlite fallback — require DATABASE_URL
- Add connection pooling config
- PAUSE: Ask user for DATABASE_URL from Railway

TASK 0.4 — Create Assessment Schema:
- Replace existing schema in src/models/Schema.ts with: assessments, email_logs, analytics_events, rate_limits tables (see PRD for full schema)
- Add all indexes as specified in PRD
- Generate and run migration with drizzle-kit

TASK 0.5 — Configure Sentry:
- Update Sentry config for the project
- PAUSE: Ask user for SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT

TASK 0.6 — Environment Validation:
- Update src/libs/Env.ts with Zod schemas for all required env vars
- Separate server and client variables
- Add descriptive error messages

TASK 0.7 — Deployment prep:
- Ensure build passes
- Output deployment checklist for Railway setup
- PAUSE: Ask user to deploy to Railway and confirm custom domain works

TASK 0.8 — CI Pipeline:
- Update .github/workflows/ to: install → lint → type-check → build → test
- Remove Codecov, Percy, Storybook, deployment steps
- Use Node.js 20
- Cache npm dependencies

Verify: After all tasks, run build + lint + type-check to confirm everything passes.
```

### Claude Code Interactive Prompt — Phase 0 Manual Steps

```
I need help implementing Phase 0 of the Investor Readiness Assessment Tool.
Read the PRD at docs/prds/phase-0-boilerplate-setup.md for full details.

This phase requires several manual setup steps. Here's how we'll work:

1. START by stripping the boilerplate (Task 0.1) — remove i18n, multi-tenancy,
   Stripe, landing page templates, Storybook, Percy, Crowdin, and the todo schema.
   Flatten the route structure. Clean package.json. Verify build passes.

2. Then configure Clerk auth (Task 0.2) — but STOP and ask me for the API keys.
   While waiting, you can work on updating the middleware and route structure.

   MANUAL ACTION NEEDED: I need to:
   - Go to clerk.com and create a new application
   - Enable email/password + Google OAuth sign-in methods
   - Copy the Publishable Key and Secret Key

3. Configure Drizzle (Task 0.3) — STOP and ask me for the DATABASE_URL.
   While waiting, set up the Drizzle config structure.

   MANUAL ACTION NEEDED: I need to:
   - Go to Railway and create a PostgreSQL database
   - Copy the connection string

4. Create the assessment schema (Task 0.4) — build the schema with all four
   tables and run the migration.

5. Configure Sentry (Task 0.5) — STOP and ask me for Sentry credentials.

   MANUAL ACTION NEEDED: I need to:
   - Go to sentry.io and create a new Next.js project
   - Copy the DSN, auth token, org slug, and project slug

6. Environment validation (Task 0.6) — update Env.ts with all variables.

7. CI Pipeline (Task 0.8) — update GitHub Actions workflow.

8. Final verification — run build, lint, and type-check.

After all code tasks are done, give me a Railway deployment checklist
so I can deploy (Task 0.7) with all the right environment variables.

Please start with Task 0.1 (stripping the boilerplate) and proceed
sequentially, stopping at each manual step to ask me for the required values.
```

---

## Phase 1: Landing Page

### RalphWiggum Prompt — Phase 1

```
@ralphwiggum implement docs/prds/phase-1-landing-page.md

Context: Boilerplate has been stripped (Phase 0 complete). App has Clerk auth, PostgreSQL database, and deploys to Railway. We need to build the landing page.

Execute the following tasks:

TASK 1.1 — Landing Page Layout:
- Create src/app/page.tsx as the landing page
- Build components in src/components/landing/:
  - Navbar.tsx — sticky nav, E3 Digital logo, Sign In link, transparent → solid on scroll
  - Hero.tsx — headline "How Ready Is Your Startup for Investment?", subheadline, CTA button → /assessment, trust badges
  - HowItWorks.tsx — 3-step visual flow with icons
  - WhatYouGet.tsx — card grid of what the assessment delivers
  - WhoItsFor.tsx — target audience section
  - SocialProof.tsx — Razaq's credibility strip with LinkedIn link
  - FAQ.tsx — collapsible accordion using Shadcn Accordion
  - FinalCTA.tsx — full-width CTA section
  - Footer.tsx — copyright, legal links, social links

TASK 1.2 — Brand Design System:
- Update tailwind.config.ts with E3 Digital colours, typography, spacing
- PAUSE: Ask user for exact brand colours and fonts from Stitch designs
- If no brand assets provided, use a professional default: navy primary (#1a1a2e), electric blue accent (#4361ee), Inter font

TASK 1.3 — Social Proof:
- Add Razaq Sherif section with LinkedIn link (https://www.linkedin.com/in/razaqsherif/)
- Styled as a trust-building credibility strip

TASK 1.4 — Google Analytics 4:
- Create src/components/GoogleAnalytics.tsx using next/script
- Track page_view (automatic), cta_click, faq_expand custom events
- Only load after cookie consent
- PAUSE: Ask user for GA4 Measurement ID (NEXT_PUBLIC_GA4_MEASUREMENT_ID)

TASK 1.5 — Cookie Consent:
- Create src/components/CookieConsent.tsx
- Fixed bottom banner with Accept/Decline/Learn More
- Store consent in localStorage (key: cookie-consent)
- GA4 only loads when consent granted
- Keyboard accessible

TASK 1.6 — Legal Pages:
- Create src/app/privacy/page.tsx — Privacy Policy (data controller: E3 Digital, list all third-party services, GDPR rights, contact: razaq@e3.digital)
- Create src/app/terms/page.tsx — Terms of Service (no investment guarantees, AI is guidance not financial advice, England and Wales law)
- Clean typography, consistent layout, back links

Verify: Landing page renders correctly, GA4 fires after consent, cookie banner works, legal pages accessible, mobile responsive at 375px/768px/1440px.
```

### Claude Code Interactive Prompt — Phase 1 Manual Steps

```
I need help implementing Phase 1 (Landing Page) of the Investor Readiness
Assessment Tool. Read the PRD at docs/prds/phase-1-landing-page.md.

This phase requires some manual inputs:

1. START by building the landing page layout (Task 1.1) — all sections
   from Navbar through Footer. Use Shadcn UI components where possible.

2. For the brand design system (Task 1.2) — STOP and ask me if I have
   specific brand colours and fonts from Stitch designs. If I don't have
   them yet, use these professional defaults:
   - Primary: #1a1a2e (navy)
   - Accent: #4361ee (electric blue)
   - Font: Inter

   MANUAL ACTION NEEDED: I may need to:
   - Export colour values from Stitch design files
   - Provide exact brand font files or names

3. For GA4 tracking (Task 1.4) — STOP and ask me for the GA4 Measurement ID.

   MANUAL ACTION NEEDED: I need to:
   - Go to analytics.google.com
   - Create a new GA4 property for assess.e3digital.net
   - Copy the Measurement ID (G-XXXXXXXXXX)

4. Build cookie consent, legal pages, and social proof sections
   without any manual dependencies.

Please start building the layout and components, and stop when you hit
a manual step. You can continue with non-blocked tasks while I handle
the manual actions.
```

---

## Phase 2: Assessment Form (Core)

### RalphWiggum Prompt — Phase 2

```
@ralphwiggum implement docs/prds/phase-2-assessment-form.md

Context: Landing page is complete (Phase 1). CTA links to /assessment. We need to build the Typeform-style multi-section assessment form.

Execute the following tasks:

TASK 2.1 — Form State Management:
- Create src/app/assessment/layout.tsx with FormProvider (React Hook Form)
- Create src/app/assessment/page.tsx as the main assessment page
- Define the full AssessmentFormData type in src/types/assessment.ts
- Single useForm() context wrapping all sections

TASK 2.2 — Reusable Question Components:
- Create src/components/assessment/questions/:
  - TextQuestion.tsx — single-line text input with label, helpText, maxLength
  - TextareaQuestion.tsx — multi-line, character count, Shift+Enter for newline
  - EmailQuestion.tsx — email input with format validation
  - NumberQuestion.tsx — numeric input with optional prefix/suffix
  - RadioCardQuestion.tsx — visual card-style radio buttons with accent colour
  - MultiSelectQuestion.tsx — checkbox-style multi-select cards
  - DropdownQuestion.tsx — Shadcn Select component
- All components: consistent styling, inline error messages, focus states

TASK 2.3 — Form Navigation:
- Create src/components/assessment/ProgressBar.tsx — fixed top, section X of Y, animated fill
- Create src/components/assessment/SectionIndicator.tsx — dot/breadcrumb indicator
- Create src/components/assessment/FormNavigation.tsx — Next/Back buttons, Submit on last section
- Keyboard support: Enter to advance, Shift+Enter in textareas, arrow keys for radio cards

TASK 2.4 — Section 1 (Problem-Market Fit):
- Build all 5 questions as specified in PRD
- Wire into form state and navigation
- Test full section flow

TASK 2.5 — Sections 2-10:
- Build remaining 9 sections with all questions as specified in PRD:
  - Section 2: Product & Traction (5 questions, with conditional branching)
  - Section 3: Business Model (4 questions)
  - Section 4: Team (4 questions)
  - Section 5: Financials (4 questions)
  - Section 6: Go-to-Market (4 questions)
  - Section 7: Legal & IP (3 questions)
  - Section 8: Investment Readiness (4 questions)
  - Section 9: Metrics & Data (3 questions)
  - Section 10: Vision & Scalability (3 questions)
- Store all question definitions in src/data/assessment-questions.ts

TASK 2.6 — Contact Info Section:
- Section 11: name, email, company, LinkedIn, source dropdown, consent checkbox
- Email validation, LinkedIn URL validation
- Consent checkbox links to /privacy
- Submit Assessment button on this section

TASK 2.7 — Zod Validation:
- Create src/lib/validation/assessment-schema.ts
- Per-section Zod schemas
- Required fields, min/max lengths, format validation
- Validate on Next click, scroll to first error
- Inline error messages with animation

TASK 2.8 — Conditional Branching:
- Section 2, Q2: "Do you have paying customers?" Yes → show Q3 (MRR) + Q4 (growth rate), No → skip to Q5
- Use React Hook Form watch() for conditional rendering
- Skip validation for hidden questions
- Adjust progress bar for skipped questions

TASK 2.9 — Animations:
- Section slide transitions (left/right, 300ms ease)
- Progress bar animated fill
- Question fade-in
- Error shake animation
- Button hover/active states
- Use CSS transitions (no heavy library unless needed)

Verify: Full form works end-to-end, all questions render, validation works, branching works, keyboard nav works, animations smooth, mobile responsive.
```

---

## Phase 3: Assessment Submission & AI Scoring

### RalphWiggum Prompt — Phase 3

```
@ralphwiggum implement docs/prds/phase-3-submission-ai-scoring.md

Context: Assessment form is complete (Phase 2). We need to handle submission, abuse prevention, AI scoring, and redirect to results.

Execute the following tasks:

TASK 3.1 — Submit Endpoint:
- Create src/app/api/assessment/submit/route.ts
- POST handler: validate body with Zod, generate UUID, hash IP, save to DB
- Return assessmentId and redirectUrl on success
- Return specific error responses (400, 403, 429)

TASK 3.2 — reCAPTCHA v3:
- Create src/lib/recaptcha.ts (client helper: load script, get token; server helper: verify token)
- Load reCAPTCHA script on assessment page
- Generate token on submit, send with request
- Server verifies with Google API, threshold 0.5
- PAUSE: Ask user for reCAPTCHA site key and secret key

TASK 3.3 — Rate Limiting:
- Create src/lib/middleware/rate-limit.ts
- Check rate_limits table: 3 submissions/hour/IP (SHA-256 hashed)
- Return 429 with retryAfter if exceeded
- Create src/lib/hash.ts for SHA-256 IP hashing

TASK 3.4 — OpenRouter AI Integration:
- Create src/lib/ai/scoring.ts
- Build structured prompt with scoring criteria for all 10 categories
- Call OpenRouter API (model configurable via AI_MODEL env var)
- Parse JSON response (handle markdown fences)
- PAUSE: Ask user for OPENROUTER_API_KEY

TASK 3.5 — AI Response Validation:
- Create Zod schema for AI scoring response (AIScoringResponseSchema)
- Validate: 10 categories each with score 0-100, overall score, readiness level, top 3 gaps, quick wins, recommendations
- On validation failure: retry once with corrective prompt
- On second failure: trigger fallback

TASK 3.6 — Manual Review Fallback:
- If AI fails: save assessment with ai_scored: false
- Still redirect to results page
- Results page shows "pending review" message
- Log failure to Sentry

TASK 3.7 — Processing Animation:
- Create src/components/assessment/ProcessingScreen.tsx
- Step-by-step progress: saving → verifying → analysing → generating → ready
- Animated spinner, checkmarks, estimated time
- No back button (prevent double submission)

TASK 3.8 — Wire End-to-End:
- Connect form submit → loading screen → API call → redirect
- Handle all error states (network, validation, rate limit, captcha, AI failure)
- Client-side: show retry button on network errors
- Client-side: return to form on validation errors

Verify: Full pipeline works — submit form, see processing animation, get redirected to results URL. Rate limiting blocks 4th submission. Invalid reCAPTCHA is rejected. AI failure triggers fallback.
```

### Claude Code Interactive Prompt — Phase 3 Manual Steps

```
I need help implementing Phase 3 (Submission & AI Scoring) of the Investor
Readiness Assessment Tool. Read the PRD at docs/prds/phase-3-submission-ai-scoring.md.

This phase requires external service credentials. Here's the plan:

1. START by building the submit endpoint, rate limiting middleware, and IP
   hashing utility — these have no external dependencies.

2. For reCAPTCHA (Task 3.2) — STOP and ask me for the keys.

   MANUAL ACTION NEEDED: I need to:
   - Go to https://www.google.com/recaptcha/admin
   - Create a new reCAPTCHA v3 site for assess.e3digital.net
   - Copy the Site Key and Secret Key

3. Build the processing animation screen while I set up reCAPTCHA.

4. For OpenRouter AI integration (Task 3.4) — STOP and ask me for the API key.

   MANUAL ACTION NEEDED: I need to:
   - Go to https://openrouter.ai/ and create an account
   - Add credits to the account
   - Generate an API key

5. Build the AI scoring prompt, response validation, and fallback logic.

6. Wire everything end-to-end and test.

Please start with the non-blocked tasks and pause at each manual step.
You can continue working on code that doesn't need the credentials while
I obtain them.
```

---

## Phase 4: Results Page

### RalphWiggum Prompt — Phase 4

```
@ralphwiggum implement docs/prds/phase-4-results-page.md

Context: Assessment submission and AI scoring are complete (Phase 3). Scored assessments exist in the database. We need to display results.

Execute the following tasks:

TASK 4.1 — Assessment API Endpoint:
- Create src/app/api/assessment/[id]/route.ts
- GET handler: fetch by UUID, return formatted data
- 404 if not found, pending flag if ai_scored: false
- No auth required (public URL)
- Rate limit reads: 30/min/IP

TASK 4.2 — Results Page Route:
- Create src/app/results/[id]/page.tsx as Server Component
- Fetch assessment data server-side
- 404 page for missing assessments
- PendingReview component for unscored assessments
- Meta tags: noindex, dynamic title

TASK 4.3 — Score Gauge:
- Create src/components/results/ScoreGauge.tsx
- Semi-circular gauge, colour-coded (green/amber/orange/red by score range)
- Animated counter from 0 to score on load (1.5s duration)
- Large score number in centre, "out of 100" label

TASK 4.4 — Readiness Level Badge:
- Create src/components/results/ReadinessLevelBadge.tsx
- Pill/badge with icon per level (rocket/target/seedling/compass)
- Summary sentence below based on readiness level

TASK 4.5 — Category Breakdown:
- Create src/components/results/CategoryBreakdown.tsx and CategoryBar.tsx
- 10 horizontal bars, colour-coded, sorted by score (highest first)
- Animated fill on scroll into view (staggered 100ms)
- Optional expand to see justification and recommendation

TASK 4.6 — Gap Cards:
- Create src/components/results/GapCard.tsx
- 3 cards: gap title, current state, recommended actions (bulleted)
- Colour-coded left border by severity
- Responsive: 3 columns → stacked on mobile

TASK 4.7 — Next Steps:
- Create src/components/results/NextSteps.tsx
- Two columns: "Do This Week" (quick wins) and "Over Next 1-3 Months" (medium-term)
- Lightning bolt and calendar icons
- Stacked on mobile

TASK 4.8 — Consultation CTA:
- Create src/components/results/ConsultationCTA.tsx
- Full-width contrasting section
- "Book Your Free Strategy Call →" button → Zoho booking URL (new tab)
- PAUSE: Ask user for Zoho booking URL

TASK 4.9 — Sticky Mobile CTA:
- Create src/components/results/StickyMobileCTA.tsx
- Fixed bottom bar on mobile (<768px)
- "Book Strategy Call" button
- Appears after scrolling past main CTA, hides when scrolling back up

TASK 4.10 — Optional Account Creation:
- Create src/components/results/SaveResults.tsx
- Below CTA: "Save Your Results — Create a free account"
- Create src/app/api/assessment/[id]/claim/route.ts — PATCH to link clerk_user_id
- Low priority, subtle design

Verify: Results page loads with correct data, gauge animates, bars animate, CTA works, mobile layout correct, pending state displays correctly.
```

### Claude Code Interactive Prompt — Phase 4 Manual Steps

```
I need help implementing Phase 4 (Results Page) of the Investor Readiness
Assessment Tool. Read the PRD at docs/prds/phase-4-results-page.md.

One manual step needed:

1. START by building the API endpoint, page route, and all visual components
   (score gauge, readiness badge, category bars, gap cards, next steps).
   These have no external dependencies.

2. For the Consultation CTA (Task 4.8) — STOP and ask me for the Zoho
   booking URL.

   MANUAL ACTION NEEDED: I need to:
   - Go to Zoho Bookings and set up a "Free Strategy Call" booking page
   - Configure 30-minute time slots
   - Copy the public booking URL

3. Continue building the sticky mobile CTA and optional account creation
   components while I set up Zoho.

Please start with all the visual components and pause only when you
need the Zoho booking URL.
```

---

## Phase 5: Email Delivery (Mailgun)

### RalphWiggum Prompt — Phase 5

```
@ralphwiggum implement docs/prds/phase-5-email-delivery.md

Context: Results page is complete (Phase 4). We need to send HTML email summaries after assessment completion.

Execute the following tasks:

TASK 5.1 — HTML Email Template:
- Create src/lib/email/templates/assessment-results.ts
- Inline CSS, table-based layout (max 600px)
- Sections: header (logo), score summary, category highlights (top 3 strong + weak), top 3 gaps, CTA buttons (view results + book call), footer with unsubscribe
- Template function that accepts assessment data and returns HTML string

TASK 5.2 — Mailgun Send Function:
- Create src/lib/email/mailgun.ts
- Use Mailgun API (EU region: api.eu.mailgun.net)
- From: info@e3digital.net, Reply-To: razaq@e3.digital
- Subject: "Your Investor Readiness Score: [SCORE]/100 — [LEVEL]"
- PAUSE: Ask user for MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_WEBHOOK_SIGNING_KEY

TASK 5.3 — Retry Logic:
- Create src/lib/email/retry.ts
- 3 attempts: immediate, +5s, +30s
- Retry on network errors and 5xx, don't retry on 4xx
- Log each attempt to email_logs table

TASK 5.4 — Mailgun Webhook:
- Create src/app/api/webhooks/mailgun/route.ts
- POST handler: verify signature, process events (delivered, opened, clicked, failed, complained)
- Update email_logs table with status and timestamps

TASK 5.5 — Wire Into Submission Flow:
- In assessment submit handler (Phase 3): add async, non-blocking email send after AI scoring
- Fire-and-forget pattern — never block results redirect
- Log failures to Sentry

TASK 5.6 — Email Log Updates:
- Create email_logs record on send attempt
- Update on successful send (message_id, sent_at)
- Update on webhook events
- Update assessment.email_sent when status reaches 'sent' or 'delivered'

Verify: Assessment completion triggers email, HTML renders in test email client, webhook events update DB, email never blocks results page.
```

### Claude Code Interactive Prompt — Phase 5 Manual Steps

```
I need help implementing Phase 5 (Email Delivery) of the Investor Readiness
Assessment Tool. Read the PRD at docs/prds/phase-5-email-delivery.md.

This phase has a significant manual dependency:

1. START by building the HTML email template (Task 5.1) — this has no
   external dependencies. Build it as a template function that returns
   an HTML string with inline CSS.

2. Build the retry logic (Task 5.3) and the webhook endpoint structure
   (Task 5.4) — the code can be written before having credentials.

3. For the Mailgun integration (Task 5.2) — STOP and ask me for credentials.

   MANUAL ACTION NEEDED: I need to:
   - Go to mailgun.com and create an account (or use existing)
   - Add and verify the domain e3digital.net (or mail.e3digital.net)
   - Set up DNS records: SPF, DKIM, DMARC for the domain
   - Wait for domain verification to complete
   - Copy: API Key, Domain name, Webhook Signing Key
   - Note: I'll also need to set up the webhook URL in Mailgun dashboard
     pointing to https://assess.e3digital.net/api/webhooks/mailgun

4. Wire the email send into the assessment submission flow.

Please build all the code first, then I'll provide the credentials
to connect everything.
```

---

## Phase 6: Brevo CRM Sync

### RalphWiggum Prompt — Phase 6

```
@ralphwiggum implement docs/prds/phase-6-brevo-crm-sync.md

Context: Assessment data is being saved and scored (Phase 3+). We need to sync contacts to Brevo CRM.

Execute the following tasks:

TASK 6.1 — Brevo API Integration:
- Create src/lib/crm/brevo.ts
- Create/update contact with assessment attributes
- Add to assessment list + readiness-level-specific list
- Parse full name into first/last name
- PAUSE: Ask user for BREVO_API_KEY and list IDs

TASK 6.2 — Wire Into Submission Flow:
- Add async, non-blocking Brevo sync after AI scoring (parallel with email)
- Fire-and-forget pattern

TASK 6.3 — Error Handling:
- Retry once on failure (10s delay)
- Log errors to Sentry, don't block user flow
- 4xx: don't retry (data issue)
- 401: don't retry (auth issue, alert via Sentry)

TASK 6.4 — Status Tracking:
- Update assessment.brevo_synced on successful sync
- Remain false on failure

Verify: Assessment completion creates Brevo contact with all attributes, contact is in correct lists, sync failures don't affect user experience.
```

### Claude Code Interactive Prompt — Phase 6 Manual Steps

```
I need help implementing Phase 6 (Brevo CRM Sync) of the Investor Readiness
Assessment Tool. Read the PRD at docs/prds/phase-6-brevo-crm-sync.md.

This phase requires Brevo setup:

1. START by building the Brevo API integration code, error handling,
   and status tracking — the code structure can be written before
   having credentials.

2. STOP and ask me for the Brevo credentials and list IDs.

   MANUAL ACTION NEEDED: I need to:
   - Go to brevo.com and create an account (or use existing)
   - Create custom contact attributes in Brevo:
     COMPANY, LINKEDIN_URL, ASSESSMENT_SCORE, READINESS_LEVEL,
     ASSESSMENT_DATE, ASSESSMENT_URL, SOURCE, TOP_GAP_1, TOP_GAP_2,
     TOP_GAP_3, HAS_PAYING_CUSTOMERS, FUNDING_STAGE, TEAM_SIZE,
     BOOKED_CALL
   - Create lists: "Assessment Completions", "Investment Ready",
     "Nearly There", "Early Stage", "Too Early"
   - Copy: API Key and all List IDs

3. Wire the sync into the assessment submission flow and test.

Please build the integration code first, then I'll provide credentials.
```

---

## Phase 7: Admin Dashboard

### RalphWiggum Prompt — Phase 7

```
@ralphwiggum implement docs/prds/phase-7-admin-dashboard.md

Context: All user-facing features are complete (Phases 0-6). We need the admin panel for operations.

Execute the following tasks:

TASK 7.1 — Admin Route Protection:
- Update middleware.ts to check Clerk admin role for /dashboard/admin/* routes
- Create admin layout: src/app/dashboard/admin/layout.tsx
- Redirect non-admins to /dashboard
- Create AdminSidebar.tsx with nav: Overview, Assessments, Analytics

TASK 7.2 — Dashboard Overview:
- Create src/app/dashboard/admin/page.tsx
- 4 KPI cards: Total Assessments, Average Score, Bookings, Conversion Rate
- Recent assessments list (last 5)
- Pending review count, failed email count
- Create src/components/admin/KPICard.tsx
- API: GET /api/admin/stats

TASK 7.3 — Assessments List:
- Create src/app/dashboard/admin/assessments/page.tsx
- Data table using @tanstack/react-table
- Columns: name, email, company, score, readiness, email status, CRM status, booked, date, actions
- Search, sort (click headers), filters (readiness, score range, date, source, booked, ai_scored, email status)
- Pagination (25/page default)
- Create src/components/admin/AssessmentTable.tsx
- API: GET /api/admin/assessments with query params

TASK 7.4 — Assessment Detail:
- Create src/app/dashboard/admin/assessments/[id]/page.tsx
- Reuse Phase 4 score components (gauge, bars, gaps)
- Add: raw form responses (expandable), status panel (AI, email, CRM, booking)
- Action buttons: Mark as Booked, Delete, Back to List
- API: GET /api/admin/assessments/[id]

TASK 7.5 — Mark as Booked:
- Create src/app/api/admin/assessments/[id]/book/route.ts
- PATCH: set booked=true, booked_at=now()
- Update Brevo contact BOOKED_CALL=true
- Toast notification on success
- Toggle to unmark

TASK 7.6 — GDPR Deletion:
- Create delete confirmation dialog (require typing "DELETE")
- DELETE /api/admin/assessments/[id]:
  - Delete email_logs (cascade)
  - Delete analytics_events (cascade)
  - Delete assessment record
  - Delete Clerk user (if clerk_user_id exists)
  - Delete Brevo contact (if email synced)
  - Log deletion to Sentry audit trail

TASK 7.7 — CSV Export:
- Create src/app/api/admin/assessments/export/route.ts
- GET with same filters as list
- Return CSV file download
- Max 10,000 rows
- Columns: name, email, company, LinkedIn, source, score, readiness, category scores, gaps, email status, CRM synced, booked, date

TASK 7.8 — Analytics Page:
- Create src/app/dashboard/admin/analytics/page.tsx
- Install Recharts (lightweight chart library)
- Charts: assessments over time (line), score distribution (bar), readiness breakdown (pie/donut), source breakdown (horizontal bar)
- Time range toggle: 30 days / 90 days / all time
- API: GET /api/admin/analytics

Verify: Admin access works, non-admins blocked, all CRUD operations work, charts render with real data, CSV exports correctly, deletion cascades properly.
```

### Claude Code Interactive Prompt — Phase 7 Manual Steps

```
I need help implementing Phase 7 (Admin Dashboard) of the Investor Readiness
Assessment Tool. Read the PRD at docs/prds/phase-7-admin-dashboard.md.

One manual step needed:

1. Build ALL tasks — this phase is primarily code with minimal external
   dependencies. The only manual step is:

   MANUAL ACTION NEEDED (Task 7.1): I need to set the admin role on my
   Clerk account:
   - Go to Clerk Dashboard → Users
   - Find my account (razaq@e3.digital)
   - Edit Public Metadata → add: { "role": "admin" }

2. I'll do this while you build the admin routes and components.

Please proceed with building the full admin dashboard. Let me know
when you need me to confirm the Clerk admin role is set so we can
test the route protection.
```

---

## Phase 8: Polish, Testing & Pre-Launch

### RalphWiggum Prompt — Phase 8

```
@ralphwiggum implement docs/prds/phase-8-polish-testing-launch.md

Context: All features are built (Phases 0-7). We need testing, polish, and launch preparation.

Execute the following tasks:

TASK 8.1 — Unit Tests:
- Write Vitest tests for:
  - AI scoring: prompt construction, response parsing, Zod validation, fallback logic
  - API routes: submit (validation, errors), get assessment (found/not found), admin endpoints (auth, CRUD)
  - Validation schemas: each section, required fields, conditional logic
  - Rate limiting: blocks after 3/hour, independent IP tracking
  - reCAPTCHA: valid/invalid/expired token handling
- Mock external APIs (OpenRouter, Mailgun, Brevo, reCAPTCHA)
- Place tests in src/__tests__/

TASK 8.2 — Playwright E2E Tests:
- Create tests/e2e/assessment-flow.e2e.ts — full happy path: landing → form → submit → results
- Create tests/e2e/form-validation.e2e.ts — validation errors, correction, progression
- Create tests/e2e/conditional-branching.e2e.ts — paying customers yes/no branches
- Create tests/e2e/results-page.e2e.ts — valid URL loads, invalid URL 404, public access
- Create tests/e2e/admin-dashboard.e2e.ts — auth, list, detail, book, export
- Create tests/e2e/cookie-consent.e2e.ts — banner, accept/decline, persistence
- Create tests/fixtures/ for test profiles and seed data

TASK 8.3-8.4 — Cross-Browser & Mobile:
- Review and fix any CSS issues for Safari, Firefox, Edge
- Ensure mobile responsive at 375px, 390px, 768px
- Verify touch targets ≥ 44px on radio cards
- Test sticky mobile CTA behaviour

TASK 8.5 — Accessibility:
- Run Lighthouse accessibility audit
- Fix any issues to achieve > 90 score
- Ensure: form labels, colour contrast, keyboard nav, focus indicators, skip nav, heading hierarchy, aria-live for errors

TASK 8.6 — Performance:
- Run Lighthouse performance audit
- Optimise images (Next.js Image, WebP)
- Optimise font loading (display: swap)
- Check bundle size, implement code splitting if needed
- Lazy load below-fold landing page sections
- Target: LCP < 2s landing, < 3s results

TASK 8.7 — Security Audit:
- Verify no secrets in client code or git history
- Verify env vars validated on startup
- Verify rate limiting works
- Verify admin routes require auth + admin role
- Verify IP hashing
- Verify webhook signature verification
- Add Content-Security-Policy headers
- PAUSE: Ask user to run Semgrep and share results

TASK 8.8 — AI Calibration:
- Create tests/fixtures/assessment-profiles.ts with 10 diverse test profiles
- Create scripts/calibrate-ai.ts to run profiles through scoring
- PAUSE: Ask user to review AI output quality and iterate on prompt if needed

TASKS 8.9-8.10 — Email & Beta Testing:
- PAUSE: Ask user to test email deliverability across providers
- PAUSE: Ask user to recruit and coordinate beta testers

TASK 8.11 — Production Deployment:
- Output final deployment checklist
- Output smoke test checklist
- PAUSE: Ask user to deploy and run smoke tests

Verify: All unit tests pass, E2E tests pass, Lighthouse > 90, no security issues, AI scores consistently.
```

### Claude Code Interactive Prompt — Phase 8 Manual Steps

```
I need help implementing Phase 8 (Polish, Testing & Pre-Launch) of the
Investor Readiness Assessment Tool. Read the PRD at docs/prds/phase-8-polish-testing-launch.md.

This phase has the most manual steps. Here's the plan:

1. START with unit tests (Task 8.1) and E2E tests (Task 8.2) — these
   are pure code tasks.

2. Then do accessibility (8.5), performance (8.6), and CSS fixes (8.3-8.4).

3. For the security audit (Task 8.7) — STOP and ask me to run Semgrep.

   MANUAL ACTION NEEDED: I need to:
   - Install and run Semgrep: npx semgrep --config=auto .
   - Share the results with you for review

4. For AI calibration (Task 8.8) — build the test profiles and calibration
   script, then STOP and ask me to review the AI output.

   MANUAL ACTION NEEDED: I need to:
   - Review the AI scoring output for each test profile
   - Confirm scores are reasonable and consistent
   - Flag any issues with the prompt for iteration

5. For email deliverability (Task 8.9) — STOP and ask me to test.

   MANUAL ACTION NEEDED: I need to:
   - Verify SPF, DKIM, DMARC records for e3digital.net
   - Send test emails to Gmail, Outlook, Apple Mail, Yahoo
   - Check inbox/spam placement
   - Verify HTML rendering across clients

6. For beta testing (Task 8.10) — STOP and ask me to coordinate.

   MANUAL ACTION NEEDED: I need to:
   - Recruit 5-10 real founders
   - Share the assess.e3digital.net link
   - Collect feedback
   - Report back any bugs or issues

7. For final deployment (Task 8.11) — give me a deployment checklist
   and smoke test checklist.

   MANUAL ACTION NEEDED: I need to:
   - Deploy to Railway production
   - Run through the full smoke test checklist
   - Confirm everything works

Please start with the automated tasks (unit tests, E2E tests, performance,
accessibility) and flag each manual step as we reach it.
```

---

## Execution Order Summary

```
Phase 0 (Setup)          → Sequential, multiple manual pauses for credentials
Phase 1 (Landing Page)   → Mostly automated, pause for brand assets + GA4 ID
Phase 2 (Assessment Form) → Fully automated (no external dependencies)
Phase 3 (Submission + AI) → Pause for reCAPTCHA keys + OpenRouter API key
Phase 4 (Results Page)    → Pause for Zoho booking URL
Phase 5 (Email)           → Pause for Mailgun credentials + DNS setup
Phase 6 (CRM Sync)       → Pause for Brevo credentials + list setup
Phase 7 (Admin Dashboard) → Mostly automated, pause for Clerk admin role
Phase 8 (Polish + Launch) → Multiple manual pauses (Semgrep, AI review, email test, beta, deploy)
```

## Manual Steps Checklist (All Phases)

Use this checklist to prepare all external services before or during implementation:

### Accounts to Create
- [ ] **Clerk** — clerk.com (auth)
- [ ] **Railway** — railway.app (hosting + PostgreSQL)
- [ ] **Sentry** — sentry.io (error monitoring)
- [ ] **Google Analytics** — analytics.google.com (GA4)
- [ ] **Google reCAPTCHA** — google.com/recaptcha (bot prevention)
- [ ] **OpenRouter** — openrouter.ai (AI scoring)
- [ ] **Mailgun** — mailgun.com (email delivery)
- [ ] **Brevo** — brevo.com (CRM)
- [ ] **Zoho Bookings** — zoho.com/bookings (consultation booking)

### API Keys & Credentials to Obtain
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk Dashboard
- [ ] `CLERK_SECRET_KEY` — Clerk Dashboard
- [ ] `DATABASE_URL` — Railway PostgreSQL
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — Sentry Project Settings
- [ ] `SENTRY_AUTH_TOKEN` — Sentry Auth Tokens
- [ ] `SENTRY_ORG` — Sentry Organization Settings
- [ ] `SENTRY_PROJECT` — Sentry Project Settings
- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID` — Google Analytics Admin
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — reCAPTCHA Admin Console
- [ ] `RECAPTCHA_SECRET_KEY` — reCAPTCHA Admin Console
- [ ] `OPENROUTER_API_KEY` — OpenRouter Dashboard
- [ ] `AI_MODEL` — default: `anthropic/claude-sonnet-4`
- [ ] `MAILGUN_API_KEY` — Mailgun Dashboard
- [ ] `MAILGUN_DOMAIN` — Mailgun Dashboard
- [ ] `MAILGUN_WEBHOOK_SIGNING_KEY` — Mailgun Dashboard
- [ ] `MAILGUN_FROM_EMAIL` — `info@e3digital.net`
- [ ] `MAILGUN_REPLY_TO` — `razaq@e3.digital`
- [ ] `BREVO_API_KEY` — Brevo Dashboard
- [ ] `BREVO_ASSESSMENT_LIST_ID` — Brevo Lists
- [ ] `BREVO_INVESTMENT_READY_LIST_ID` — Brevo Lists
- [ ] `BREVO_NEARLY_THERE_LIST_ID` — Brevo Lists
- [ ] `BREVO_EARLY_STAGE_LIST_ID` — Brevo Lists
- [ ] `BREVO_TOO_EARLY_LIST_ID` — Brevo Lists
- [ ] `ZOHO_BOOKING_URL` — Zoho Bookings

### DNS Records to Configure
- [ ] Custom domain `assess.e3digital.net` → Railway (CNAME)
- [ ] SPF record for `e3digital.net` (include Mailgun)
- [ ] DKIM record for `e3digital.net` (Mailgun key)
- [ ] DMARC record for `e3digital.net`

### Clerk Configuration
- [ ] Enable email/password sign-in
- [ ] Enable Google OAuth
- [ ] Disable other social providers
- [ ] Set admin role on Razaq's account (public metadata: `{ "role": "admin" }`)

### Brevo Configuration
- [ ] Create custom contact attributes (14 fields)
- [ ] Create 5 contact lists (Assessment Completions + 4 readiness levels)
