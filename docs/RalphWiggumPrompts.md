# RalphWiggum Implementation Prompts

> **Plugin:** RalphWiggum — Automated PRD-to-code implementation
> **Project:** Investor Readiness Assessment Tool
> **PRD Location:** `docs/prds/`

This file contains the sequenced prompts for implementing each phase of the Investor Readiness Assessment Tool. Phases are designed to be executed in order — each builds on the previous one.

For phases with **manual steps** (external service setup, API key configuration, DNS, etc.), a separate **Claude Code Interactive Prompt** is provided that will pause execution, ask the user to complete the manual action, and continue with code generation in the background.

---

## Table of Contents

1. [Phase 0: Boilerplate Setup & Configuration](#phase-0-boilerplate-setup--configuration)
2. [Phase 1: Landing Page & Design System](#phase-1-landing-page--design-system)
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

## Phase 1: Landing Page & Design System

### RalphWiggum Prompt — Phase 1

```
@ralphwiggum implement docs/prds/phase-1-landing-page.md

Context: Boilerplate has been stripped (Phase 0 complete). App has Clerk auth, PostgreSQL database, and deploys to Railway. We need to establish the application-wide design system from Stitch mockups and build the landing page to match the designs precisely.

IMPORTANT: The PRD contains a full design system specification (Section 1.1) extracted from Stitch mockups. All colours, typography, spacing, and component primitives MUST match those specifications exactly. The design system will be used by all subsequent phases.

Execute the following tasks:

TASK 1.1 — Design System Setup:
- Update tailwind.config.ts with the EXACT colour palette from the PRD:
  - Primary navy: #0f172a (dark backgrounds, hero, sidebar, dark sections)
  - Accent blue: #2563eb (CTAs, active states, progress bars)
  - Background: #f8fafc (page background, light blue-grey)
  - Surface: #ffffff (cards)
  - Border: #e2e8f0 (card borders, dividers)
  - Text primary: #0f172a, secondary: #475569, muted: #94a3b8
  - Score colours: green #22c55e, blue #3b82f6, orange #f97316, red #ef4444
  - Score background tints: green #dcfce7, blue #dbeafe, orange #ffedd5, red #fee2e2
  - CTA green: #10b981 (secondary CTA buttons like "Book Strategy Call")
- Configure Inter font (Google Fonts) as the sole font family
- Set up typography scale: 48px hero, 30px section, 20px card, 16px body, 14px small, 12px caption
- Configure spacing: 8px grid, consistent section padding (py-16 md:py-24)
- Configure border radius: rounded-xl (12px) for cards, rounded-lg (8px) for buttons
- Set up shadow scale: shadow-sm for cards

TASK 1.2 — Landing Page Components:
- Create src/app/page.tsx as the landing page
- Build components in src/components/landing/:

  Navbar.tsx:
  - Left: E3 Digital blue square icon + "E3 Digital" text
  - Centre: "How it works", "Benefits", "FAQ" (smooth-scroll anchor links)
  - Right: "Login" text link + "Start Assessment" blue filled button (#2563eb)
  - Sticky on scroll, transparent over dark hero → solid white background on scroll
  - Mobile: hamburger menu

  Hero.tsx (DARK navy background #0f172a):
  - Two-column layout: text left, score preview right
  - Light blue pill badge: "For Non-Technical Founders"
  - Headline: "How Investor-Ready Is Your Startup?" — "Startup?" highlighted in accent colour
  - Subheadline: "Get a free, AI-powered evaluation of your B2B SaaS venture's readiness for investment in under 10 minutes." in muted text (#94a3b8)
  - Two CTA buttons side by side:
    - "Start Free Assessment →" (blue filled #2563eb) → /assessment
    - "View Sample Report" (white outline) → /results/sample
  - Social proof: avatar stack (3-4 overlapping circles) + "Used by 1,000+ founders"
  - Right column: static decorative score gauge showing "82" with coloured semi-circular arc + green "Investor Ready" badge — this is illustration only, not functional
  - NO accelerator trust badges (removed from design)

  HowItWorks.tsx (light background #f8fafc):
  - Section heading: "How It Works" centred
  - 3 white cards in a row (stacked mobile), each with:
    - Numbered step in coloured circle
    - Icon in pastel-coloured circle (blue, green, purple backgrounds)
    - Title: "Answer Questions" / "Get Analyzed" / "Receive Report"
    - 1-2 line description
  - Cards: white, border #e2e8f0, rounded-xl, p-6, centred content

  WhatYouGet.tsx (light background):
  - Two-column: text left, 2×2 card grid right
  - Left: heading "What You'll Get", subheading, green-checkmark bullet list:
    - Personalised readiness score out of 100
    - 10-category breakdown of investor criteria
    - Top 3 gaps with specific recommendations
    - Quick wins you can implement this week
  - Left: "See Example Report →" link → /results/sample
  - Right: 2×2 grid of white cards:
    - "Readiness Score" (blue/purple icon circle)
    - "Gap Analysis" (orange/amber icon circle)
    - "Financial Health Check" (green icon circle)
    - "Pitch Deck Audit" (pink/red icon circle)
  - Each card: icon in coloured pastel circle, title, 1-line description

  FAQ.tsx (light background):
  - Heading: "Frequently Asked Questions" centred
  - Subheading: "Everything you need to know about the assessment" muted, centred
  - Max-width ~768px centred
  - Shadcn Accordion, collapsible, single-open:
    - "How long does the assessment take?" → ~8-10 minutes
    - "Is it really free?" → Yes, completely free
    - "What happens with my data?" → Link to /privacy
    - "How accurate is the AI scoring?" → Based on real investor criteria
  - Chevron icon that rotates on expand

  FinalCTA.tsx (DARK navy background #0f172a):
  - Full-width dark banner
  - Heading: "Ready to see where you stand?" white, centred
  - Subheading: brief encouragement in muted text
  - "Start Assessment" blue filled button, centred

  Footer.tsx (dark navy background):
  - 4-column grid (stacked mobile):
    - Col 1: E3 Digital logo + tagline + social icons (LinkedIn, X/Twitter)
    - Col 2 "Product": Assessment, How it works, FAQ
    - Col 3 "Resources": Privacy Policy, Terms of Service
    - Col 4 "Company": About (→ e3.digital), Contact (→ mailto:razaq@e3.digital)
  - Bottom bar: "© 2025 E3 Digital. All rights reserved." left, "Privacy Policy · Terms of Service" right
  - White/muted text on dark background

TASK 1.3 — Sample Results Page:
- Create src/app/results/sample/page.tsx with hardcoded sample data
- Score ~82, "Investor Ready" status, realistic category scores
- Simplified static versions of score gauge + category bars + gap cards
- Banner at top: "This is a sample report. Start your own assessment to get personalised results." with CTA
- Will be refined in Phase 4 when full results components are built

TASK 1.4 — Social Proof:
- Integrate "Razaq Sherif, Founder at E3 Digital" subtly into the hero section or as a trust strip
- LinkedIn link: https://www.linkedin.com/in/razaqsherif/
- Keep subtle, not a full-width section

TASK 1.5 — Google Analytics 4:
- Create src/components/GoogleAnalytics.tsx using next/script
- Track page_view (automatic), cta_click, faq_expand custom events
- Only load after cookie consent
- PAUSE: Ask user for GA4 Measurement ID (NEXT_PUBLIC_GA4_MEASUREMENT_ID)

TASK 1.6 — Cookie Consent:
- Create src/components/CookieConsent.tsx
- Fixed bottom banner: white card, rounded, shadow
- Text + Accept/Decline/Learn More buttons
- Store consent in localStorage (key: cookie-consent)
- GA4 only loads when consent granted
- Keyboard accessible

TASK 1.7 — Legal Pages:
- Create src/app/privacy/page.tsx — Privacy Policy (data controller: E3 Digital, all third-party services, GDPR rights, contact: razaq@e3.digital)
- Create src/app/terms/page.tsx — Terms of Service (no investment guarantees, AI is guidance not financial advice, England and Wales law)
- Use Navbar + Footer for consistent layout
- Clean typography, last updated date, back links

Verify: Design system tokens configured, landing page matches Stitch mockup precisely, hero two-column layout renders, score gauge preview displays, all sections render, GA4 fires after consent, cookie banner works, legal pages accessible, sample results page loads, mobile responsive at 375px/768px/1440px.
```

### Claude Code Interactive Prompt — Phase 1 Manual Steps

```
I need help implementing Phase 1 (Landing Page & Design System) of the
Investor Readiness Assessment Tool.

Read the PRD at docs/prds/phase-1-landing-page.md — it contains a FULL
design system specification (Section 1.1) extracted from Stitch mockups
and a detailed landing page layout (Section 1.2) that must be matched
precisely.

CRITICAL: The design system established here is used by ALL subsequent
phases. Get the Tailwind tokens right.

Here's the plan:

1. START with the design system (Task 1.1) — configure tailwind.config.ts
   with the EXACT colour palette, typography, spacing, and component
   primitives from the PRD. Key colours:
   - Primary navy: #0f172a
   - Accent blue: #2563eb
   - Background: #f8fafc
   - Score colours: green #22c55e, blue #3b82f6, orange #f97316, red #ef4444
   - CTA green: #10b981
   - Font: Inter (Google Fonts)
   The full palette is in the PRD Section 1.1.

2. Build the landing page components (Task 1.2) matching the Stitch
   mockup EXACTLY. Key design points:
   - Hero is TWO-COLUMN: text left, decorative score gauge (showing "82") right
   - Hero has DARK navy background (#0f172a)
   - "For Non-Technical Founders" pill badge above headline
   - Two CTA buttons: "Start Free Assessment →" (blue) + "View Sample Report" (white outline)
   - Avatar stack + "Used by 1,000+ founders" social proof line
   - NO accelerator trust badges (YC, Techstars etc. removed)
   - How It Works: 3 white cards with numbered steps + pastel icon circles
   - What You'll Get: text with checkmarks LEFT, 2×2 card grid RIGHT
   - FAQ: centred accordion, max-width ~768px
   - Final CTA: dark navy full-width banner
   - Footer: 4-column dark navy, in-scope links only (no Pricing/Blog/Careers)
   - Nav links: "How it works", "Benefits", "FAQ" + "Login" + "Start Assessment" button

3. Build a static sample results page (Task 1.3) at /results/sample
   with hardcoded data — this is the "View Sample Report" destination.

4. For GA4 tracking (Task 1.5) — STOP and ask me for the GA4 Measurement ID.

   MANUAL ACTION NEEDED: I need to:
   - Go to analytics.google.com
   - Create a new GA4 property for assess.e3digital.net
   - Copy the Measurement ID (G-XXXXXXXXXX)

5. Build cookie consent (Task 1.6), legal pages (Task 1.7), and social
   proof integration (Task 1.4) without any manual dependencies.

Please start with the design system setup, then build the landing page
components. The only manual pause is for the GA4 Measurement ID.
You can build everything else without waiting.
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

TASK 2.2 — Reusable Question Components (MUST match Stitch mockup):
- Create src/components/assessment/questions/:
  - TextQuestion.tsx — single-line text input, white bg, border #e2e8f0, rounded-lg, focus border #2563eb
  - TextareaQuestion.tsx — multi-line, character count, Shift+Enter for newline
  - EmailQuestion.tsx — email input with format validation
  - NumberQuestion.tsx — numeric input with optional prefix/suffix
  - RadioCardQuestion.tsx — KEY COMPONENT per Stitch design:
    - Full-width clickable cards, stacked vertically with gap-3
    - Each card: icon in light grey #f1f5f9 circle (left) + bold title + description (muted #475569)
    - Unselected: white bg, border #e2e8f0, grey circle placeholder on right
    - Selected: border #2563eb, blue checkmark circle on right (#2563eb bg, white checkmark), subtle blue tint bg (#eff6ff)
    - Card: rounded-xl, p-4, cursor pointer
  - MultiSelectQuestion.tsx — same card styling as RadioCard, allows multiple selections
  - DropdownQuestion.tsx — Shadcn Select, white bg, border #e2e8f0, rounded-lg
- Question container: white card, border #e2e8f0, rounded-xl, p-6 md:p-8, centred max-width ~640px
- Question label: text-xl font-semibold text-[#0f172a]
- Help text: text-sm text-[#475569] below label
- Error messages: text-sm text-[#ef4444] inline below input

TASK 2.3 — Form Navigation (MUST match Stitch mockup):
- Top navbar: "E3 Digital" logo left + "Save & Exit" ghost button right
- Progress bar below navbar: "SECTION X OF Y" left (uppercase text-xs), "XX% Completed" right, blue #2563eb fill bar h-2 rounded-full on #e2e8f0 track
- Navigation below question card: divider line (border-t #e2e8f0) then:
  - Left: "← Back" text link, text-sm font-medium text-[#475569]
  - Right: "Continue →" blue filled button #2563eb, rounded-lg px-6 py-3 font-semibold
  - Last section: "Submit Assessment" replaces Continue
- Footer: "© 2025 E3 Digital. All rights reserved." text-xs text-[#94a3b8] centred
- Page background: #f8fafc
- Keyboard: Enter to advance, Shift+Enter in textareas, arrow keys for radio cards

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

TASK 3.7 — Processing Animation (MUST match Stitch mockup):
- Create src/components/assessment/ProcessingScreen.tsx
- Page background: #f1f5f9
- Top navbar: "E3 Digital" logo left, "STATUS • Processing" pill badge with pulsing dot right
- Centred white card: max-width ~480px, rounded-xl, p-8, shadow-sm, border #e2e8f0
- Card content:
  - Top: circular blue spinner (#2563eb spinning arc)
  - Heading: "Preparing your personalised report..." text-xl font-semibold centred
  - Subtext: explains AI analysis, text-sm text-[#475569] centred
- Vertical timeline/step list with connecting line:
  - Completed step: green circle #22c55e with white checkmark + label in dark text + "Complete" green text
  - Active step: blue spinner circle #2563eb + label in blue + "Processing..." blue text
  - Pending step: grey circle outline #e2e8f0 + label in muted #94a3b8 + "Waiting"
  - Steps: "Analyzing responses" → "Scoring 10 criteria" → "Generating recommendations"
- Bottom progress bar: h-2 rounded-full, track #e2e8f0, fill #2563eb
- Footer: "POWERED BY E3 Digital" text-xs text-[#94a3b8] uppercase
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

IMPORTANT: The PRD contains a detailed Stitch mockup specification for
the processing screen (Section 3.7). Match the design precisely.

Key design points for the processing screen from Stitch mockup:
- Background: #f1f5f9, centred white card (max-width ~480px, rounded-xl)
- Top navbar: "E3 Digital" logo + "STATUS • Processing" pill badge
- Card: blue spinner at top, heading, subtext, then VERTICAL TIMELINE
  with connecting line showing 3 steps:
  - Completed: green circle with checkmark + "Complete" green text
  - Active: blue spinner circle + "Processing..." blue text
  - Pending: grey circle outline + "Waiting" muted text
- Bottom progress bar in card, "POWERED BY E3 Digital" footer

This phase requires external service credentials. Here's the plan:

1. START by building the submit endpoint, rate limiting middleware, and IP
   hashing utility — these have no external dependencies.

2. For reCAPTCHA (Task 3.2) — STOP and ask me for the keys.

   MANUAL ACTION NEEDED: I need to:
   - Go to https://www.google.com/recaptcha/admin
   - Create a new reCAPTCHA v3 site for assess.e3digital.net
   - Copy the Site Key and Secret Key

3. Build the processing animation screen (matching Stitch mockup) while
   I set up reCAPTCHA.

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

TASK 4.2 — Results Page Route & Layout (MUST match Stitch mockup):
- Create src/app/results/[id]/page.tsx as Server Component
- Top navbar: "E3 Digital" logo left, nav links centre, "Log Out" + avatar right
- Navbar: solid white background, bottom border #e2e8f0
- Fetch assessment data server-side
- 404 page for missing assessments
- PendingReview component for unscored assessments
- Meta tags: noindex, dynamic title

TASK 4.3 — Score Gauge Hero (MUST match Stitch mockup — DARK navy hero):
- Create src/components/results/ScoreGauge.tsx
- DARK navy background section (#0f172a), centred content
- Readiness badge pill at top (see Task 4.4)
- FULL CIRCLE gauge (not semi-circular) with thick coloured arc stroke
  - ~200px diameter, arc colour by score range (green/yellow/orange/red)
  - Background arc: rgba(255,255,255,0.1)
- Large score number in centre: text-5xl font-bold text-white
- "SCORE" label below number: text-xs uppercase tracking-wider text-[#94a3b8]
- Heading below gauge: "Your Investor Readiness Score" text-2xl font-bold text-white
- Summary paragraph: text-base text-[#94a3b8], centred, max-width ~600px
- "Download Full Report" white outline button with download icon (smooth-scrolls to details below)
- Animated fill on load: counter 0→score + arc fill simultaneously (1.5s easing)

TASK 4.4 — Readiness Level Badge (Stitch mockup):
- Create src/components/results/ReadinessLevelBadge.tsx
- Rounded-full pill positioned above score gauge in dark hero
- Coloured bg tint + coloured text + icon per level:
  - Investment Ready: green pill bg-[#dcfce7] text-[#22c55e], rocket icon
  - Nearly There: green/teal pill, target icon
  - Early Stage: orange pill bg-[#ffedd5] text-[#f97316], seedling icon
  - Too Early: red pill bg-[#fee2e2] text-[#ef4444], compass icon
- px-4 py-1.5, text-sm font-medium

TASK 4.5 — Category Breakdown (MUST match Stitch mockup):
- Create src/components/results/CategoryBreakdown.tsx and CategoryBar.tsx
- White card container, rounded-xl, border #e2e8f0, p-6
- Heading: "Category Breakdown", timestamp: "Last updated: X hours ago" text-xs text-[#94a3b8]
- 2-COLUMN GRID layout (5 rows × 2 cols = 10 categories) on desktop, single column mobile
- Each bar: category name (text-sm font-medium) + score % (right-aligned, coloured) + h-2 rounded-full progress bar
- Bar colours: green #22c55e (75-100), blue #3b82f6 (60-74), orange #f97316 (40-59), red #ef4444 (0-39)
- Animated fill on scroll (staggered 100ms)

TASK 4.6 — Gap Cards (MUST match Stitch mockup):
- Create src/components/results/GapCard.tsx
- Heading: "Top 3 Gaps to Address"
- 3 white cards in a row (stacked mobile), gap-6
- Each card: rounded-xl, border #e2e8f0, p-6
  - Large emoji/icon at top (text-2xl)
  - Title: text-lg font-semibold
  - Description: text-sm text-[#475569]
  - Bottom: "See Resource →" link in accent blue #2563eb text-sm font-medium
- NO coloured left border (Stitch uses clean card style with top emoji)

TASK 4.7 — Next Steps:
- Create src/components/results/NextSteps.tsx
- Two columns: "Do This Week" (quick wins) and "Over Next 1-3 Months" (medium-term)
- Lightning bolt and calendar icons
- Stacked on mobile

TASK 4.8 — Consultation CTA (MUST match Stitch mockup — DARK navy section):
- Create src/components/results/ConsultationCTA.tsx
- Dark navy background #0f172a, full-width, centred content
- Heading: "Ready to close those gaps?" text-3xl font-bold text-white
- Subheadline: text-base text-[#94a3b8]
- CTA button: "Book Your Free Strategy Call" GREEN filled #10b981 (not blue), white text, rounded-lg px-8 py-3
- Button → Zoho booking URL (new tab)
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

IMPORTANT: The PRD contains detailed Stitch mockup specifications for
every component. Match the designs precisely.

Key design points from Stitch mockup:
- Score hero: DARK navy background (#0f172a), FULL CIRCLE gauge (not
  semi-circular), large white score number, "SCORE" label, readiness
  badge pill above gauge, "Download Full Report" white outline button
- Category breakdown: white card, 2-COLUMN GRID (5 rows × 2 cols),
  coloured progress bars (green/blue/orange/red by score range)
- Gap cards: 3 white cards with emoji/icon at top, "See Resource →"
  link at bottom, NO coloured left border
- CTA: dark navy section, "Ready to close those gaps?", GREEN button
  (#10b981) for "Book Your Free Strategy Call"

One manual step needed:

1. START by building the API endpoint, page route, and all visual components
   (score gauge hero, readiness badge, category bars, gap cards, next steps).
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

TASK 7.1 — Admin Route Protection & Layout (MUST match Stitch mockup):
- Update middleware.ts to check Clerk admin role for /dashboard/admin/* routes
- Create admin layout: src/app/dashboard/admin/layout.tsx
- Redirect non-admins to /dashboard

  Admin layout per Stitch mockup:

  DARK SIDEBAR (left, fixed, ~260px):
  - Background: #0f172a navy, full viewport height
  - Top: "E3 Digital" logo (blue square icon + white text) + "ADMIN PANEL" label (text-xs uppercase tracking-wider text-[#94a3b8])
  - "MANAGEMENT" section label (text-xs uppercase text-[#64748b]):
    - Dashboard (grid icon), Assessments (clipboard), Analytics (bar-chart), Founders (users)
    - Nav items: text-sm text-[#94a3b8], hover: text-white, active: text-white bg-white/10 rounded-lg px-3 py-2
  - "SYSTEM" section: Settings (cog), Support (help-circle)
  - Bottom: user avatar + name "Razaq Sherif" + "Super Admin" role (text-sm text-white, text-xs text-[#94a3b8])

  TOP BAR (right of sidebar):
  - White background, bottom border #e2e8f0
  - Left: search input (rounded-lg border-[#e2e8f0] bg-[#f8fafc])
  - Right: notification bell (red dot badge) + "+ Create New" blue button #2563eb

  Content area: background #f8fafc, p-6

TASK 7.2 — Dashboard Overview (MUST match Stitch mockup):
- Create src/app/dashboard/admin/page.tsx
- Page header: "Dashboard Overview" text-2xl font-bold + "Welcome back, Razaq." subheading text-sm text-[#475569]

  4 KPI Cards (Stitch design) in grid-cols-4:
  - White card, border #e2e8f0, rounded-xl, p-6
  - Top row: icon in coloured pastel circle (w-10 h-10 rounded-xl) LEFT + percentage badge pill RIGHT
    - Green badge (bg-[#dcfce7] text-[#22c55e]) with up arrow for positive
    - Red badge (bg-[#fee2e2] text-[#ef4444]) with down arrow for negative
  - Middle: label text-sm text-[#475569]
  - Bottom: large value text-3xl font-bold text-[#0f172a]
  Cards: Total Assessments (blue icon), Average Score (purple icon), Bookings (green icon), Conversion Rate (orange icon)

  Recent Assessments table (Stitch design):
  - White card, border, rounded-xl
  - Columns: avatar+name+company (two-line), date (relative), score (number + coloured bar), status (coloured pill badge), actions (kebab menu)
  - Last 5 rows, hover bg-[#f8fafc]
  - Pagination footer: "Showing 1 to 5 of X results" left, Previous/Next ghost buttons right

- API: GET /api/admin/stats

TASK 7.3 — Assessments List (same Stitch table design as overview):
- Create src/app/dashboard/admin/assessments/page.tsx
- Data table using @tanstack/react-table
- Same design pattern as overview table: avatar+name+company two-line, score with coloured bar, readiness pill badge, kebab actions menu
- Columns: avatar+name+company, email, score+bar, readiness badge, email status icon, CRM status icon, booked badge, relative date, kebab actions
- Search, sort (click headers), filters (readiness, score range, date, source, booked, ai_scored, email status)
- Pagination: "Showing 1 to 25 of X" left, Previous/Next ghost buttons right (rounded-lg border px-3 py-1.5)
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

IMPORTANT: The PRD contains detailed Stitch mockup specifications for
the admin layout, sidebar, KPI cards, and data tables. Match the designs
precisely.

Key design points from Stitch mockup:
- DARK SIDEBAR (left, fixed, ~260px): navy #0f172a bg, "E3 Digital"
  logo + "ADMIN PANEL" label, Management nav (Dashboard, Assessments,
  Analytics, Founders), System nav (Settings, Support), user info at
  bottom with avatar
- TOP BAR: white bg, search input left, notification bell + "+ Create
  New" blue button right
- KPI CARDS: icon in pastel circle LEFT + percentage change badge RIGHT
  (green up / red down), label text middle, large value bottom
- DATA TABLE: avatar+name+company two-line cells, score with small
  coloured progress bar, readiness pill badges (coloured), kebab menu
  actions, "Showing 1 to X of Y" pagination with Previous/Next buttons

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
Phase 1 (Landing + Design) → Design system from Stitch mockups + landing page, pause for GA4 ID
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
