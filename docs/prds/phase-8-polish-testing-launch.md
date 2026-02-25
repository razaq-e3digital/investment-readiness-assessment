# PRD: Phase 8 — Polish, Testing & Pre-Launch

## Overview

**Phase:** 8
**Title:** Polish, Testing & Pre-Launch
**Goal:** Quality assurance, performance optimisation, security hardening, AI calibration, and launch readiness verification.
**Priority:** Critical — gate to production launch
**Estimated Effort:** 2–3 days
**Depends On:** All previous phases (0-7)

---

## Problem Statement

Before launching publicly, the application must be thoroughly tested, performant, accessible, secure, and the AI scoring must be calibrated to produce consistent and reasonable results. A buggy or slow launch will undermine trust with founders — the exact audience we're trying to build credibility with.

---

## Success Criteria (Definition of Done)

- [ ] Unit tests pass for scoring logic, API routes, and validation schemas
- [ ] Playwright E2E tests cover the full assessment flow
- [ ] Cross-browser testing passes (Chrome, Safari, Firefox, Edge)
- [ ] Mobile testing passes (iOS Safari, Android Chrome)
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] LCP < 2s (landing page), < 3s (results page)
- [ ] AI processing completes in < 30 seconds
- [ ] Security audit passes (no exposed keys, rate limits working, auth enforced)
- [ ] AI scoring produces consistent and reasonable results across 10 test assessments
- [ ] Emails deliver to inbox (not spam) across Gmail, Outlook, Apple Mail
- [ ] 5+ beta testers have completed the full flow successfully
- [ ] Production deployment is smoke tested

---

## Detailed Requirements

### 8.1 — Unit Tests

**Test targets:**

1. **AI Scoring Logic** (`src/lib/ai/scoring.ts`)
   - Prompt construction builds correct prompt for different response combinations
   - Response parsing handles valid JSON
   - Response parsing handles malformed JSON (strips markdown fences, etc.)
   - Zod validation catches invalid AI responses
   - Fallback logic triggers correctly on AI failure
   - Score ranges are within bounds (0-100)

2. **API Routes**
   - `POST /api/assessment/submit` — validates request, returns correct errors for invalid data
   - `GET /api/assessment/[id]` — returns correct data, 404 for missing
   - `PATCH /api/admin/assessments/[id]/book` — updates correctly, requires admin auth
   - `DELETE /api/admin/assessments/[id]` — cascading deletion works
   - `GET /api/admin/assessments` — pagination, filtering, sorting

3. **Validation Schemas**
   - Each assessment section's Zod schema validates correctly
   - Required fields are enforced
   - Conditional logic (e.g., paying customers branch) validates correctly
   - Email format validation
   - Number range validation

4. **Rate Limiting**
   - Blocks after 3 submissions/hour/IP
   - Different IPs are tracked independently
   - Window resets correctly

5. **reCAPTCHA Verification**
   - Valid token passes
   - Invalid/expired token fails
   - Score below threshold is handled correctly

**Framework:** Vitest (already configured)
**Mocking:** Mock external APIs (OpenRouter, Mailgun, Brevo, reCAPTCHA) in tests

### 8.2 — Playwright E2E Tests

**Test scenarios:**

1. **Full Assessment Flow (Happy Path)**
   ```
   Landing page → Click "Start Assessment" →
   Complete all 10 sections + contact info →
   Submit → See processing animation →
   Redirect to results page →
   Verify score gauge, category bars, gaps, CTA displayed
   ```

2. **Form Validation**
   - Try to advance without answering required questions
   - Enter invalid email format
   - Verify error messages appear
   - Verify errors clear on correction

3. **Conditional Branching**
   - Select "Yes" to paying customers → verify MRR question appears
   - Select "No" → verify MRR question is skipped

4. **Results Page Access**
   - Access valid results URL → page loads
   - Access invalid UUID → 404 page
   - Access results without auth → still works (public)

5. **Admin Dashboard**
   - Non-admin access → redirected
   - Admin access → dashboard loads
   - Assessment list → search, filter, sort work
   - Assessment detail → all data displayed
   - Mark as booked → status updates
   - CSV export → file downloads

6. **Cookie Consent**
   - Banner appears on first visit
   - Accept → GA4 loads
   - Decline → GA4 does not load
   - Choice persists on reload

**Framework:** Playwright (already configured)
**Note:** E2E tests should use a test database seeded with known assessment data

### 8.3 — Cross-Browser Testing

**Browsers to test:**
- Chrome (latest)
- Safari (latest on macOS)
- Firefox (latest)
- Edge (latest)

**Key areas to verify:**
- Landing page layout and animations
- Assessment form (all question types)
- Form navigation and keyboard shortcuts
- Results page (score gauge animation, bar charts)
- Admin dashboard (data table, charts)
- Cookie consent banner
- Sign in/up flows (Clerk components)

**Known risk areas:**
- CSS animations may differ across browsers
- Safari flexbox/grid rendering quirks
- Firefox form input styling differences

### 8.4 — Mobile Testing

**Devices/viewports to test:**
- iPhone SE (375px) — smallest common screen
- iPhone 14 (390px)
- iPad (768px)
- Android phone (360px, Chrome)

**Key areas to verify:**
- Landing page responsive layout
- Assessment form usability on small screens
- Radio card tap targets (min 44px)
- Progress bar readability
- Results page layout (stacked columns)
- Sticky mobile CTA (fixed bottom bar)
- Admin dashboard (may be limited — desktop-first is acceptable)
- Navigation/hamburger menu

### 8.5 — Accessibility Audit

**Targets:**
- Lighthouse Accessibility score > 90
- WCAG 2.1 AA compliance

**Checklist:**
- All images have alt text
- Form inputs have labels (visible or aria-label)
- Colour contrast ratios meet AA standards (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation works throughout (Tab, Enter, Escape, Arrow keys)
- Focus indicators are visible
- Screen reader announces form progress, errors, and results
- Skip navigation link exists
- Page headings follow logical hierarchy (h1 → h2 → h3)
- Error messages are announced to screen readers (aria-live)
- Score gauge has text alternatives for screen readers

### 8.6 — Performance Audit

**Targets:**
- Landing page LCP < 2 seconds
- Results page LCP < 3 seconds
- Assessment form TTI < 2 seconds
- AI processing < 30 seconds (95th percentile)
- Lighthouse Performance score > 90

**Optimisation areas:**
- Image optimisation (use Next.js Image component, WebP format)
- Font loading strategy (display: swap)
- JavaScript bundle size (check with bundle analyser)
- Server-side rendering for results page
- Lazy load below-fold components on landing page
- Minimise third-party script impact (GA4, reCAPTCHA)

### 8.7 — Security Audit

**Checklist:**
- [ ] No API keys or secrets in client-side code or git history
- [ ] Environment variables validated on startup
- [ ] reCAPTCHA preventing bot submissions
- [ ] Rate limiting preventing abuse
- [ ] Admin routes require authentication + admin role
- [ ] Assessment UUIDs are unguessable (v4)
- [ ] IP addresses are hashed (never stored raw)
- [ ] SQL injection not possible (Drizzle ORM parameterised queries)
- [ ] XSS not possible (React auto-escapes, no dangerouslySetInnerHTML)
- [ ] CSRF protection (Next.js built-in for API routes)
- [ ] Webhook signatures verified (Mailgun)
- [ ] No sensitive data in error messages or logs
- [ ] Content Security Policy headers configured
- [ ] HTTPS enforced (Railway handles this)
- [ ] Run Semgrep or similar SAST tool — no critical findings

**MANUAL STEP:** Run Semgrep security scan and review findings.

### 8.8 — AI Scoring Calibration

**Process:**
1. Create 10 diverse test assessment profiles:
   - Profile 1: "Investment Ready" founder (strong across all categories)
   - Profile 2: "Nearly There" founder (strong product, weak financials)
   - Profile 3: "Early Stage" founder (idea stage, some validation)
   - Profile 4: "Too Early" founder (concept only, solo, no customers)
   - Profiles 5-10: variations across different weak/strong combinations

2. Run each profile through the AI scoring 3 times
3. Verify:
   - Scores are consistent (±5 points across runs for same profile)
   - Scores are reasonable (strong profiles score higher)
   - Readiness levels match expected tier
   - Recommendations are specific and actionable (not generic)
   - Gaps identified are genuinely the weakest areas
   - No hallucinated or nonsensical recommendations

4. If scores are inconsistent or unreasonable:
   - Adjust the AI prompt (add scoring rubric, examples, constraints)
   - Adjust the model (try different OpenRouter models)
   - Adjust the temperature parameter (lower = more consistent)

**MANUAL STEP:** Review AI output quality manually and iterate on prompt.

### 8.9 — Email Deliverability Testing

**DNS checks:**
- SPF record configured for e3digital.net (includes Mailgun)
- DKIM configured for e3digital.net (Mailgun signing)
- DMARC record set (at minimum p=none for monitoring)

**Inbox testing:**
- Send test emails to:
  - Gmail (personal and Google Workspace)
  - Outlook (personal and Microsoft 365)
  - Apple Mail (iCloud)
  - Yahoo Mail
- Verify emails land in inbox (not spam/junk)
- Verify HTML renders correctly
- Verify all links work (results page, booking link, unsubscribe)
- Verify sender name and reply-to display correctly

**MANUAL STEP:** Send test emails to multiple providers, check inbox/spam placement, verify DNS records.

### 8.10 — Beta Testing

**Recruit 5-10 real founders to test:**
- Share assess.e3digital.net link
- Ask them to complete the full assessment honestly
- Collect feedback on:
  - Clarity of questions
  - UX/flow experience
  - Score accuracy ("Does this feel right?")
  - Results page value ("Was this helpful?")
  - Email receipt
  - Any bugs or confusion

**Feedback collection:**
- Short feedback form or direct conversation
- Track: completion rate, time to complete, drop-off points

**MANUAL STEP:** Recruit beta testers, send them the link, collect and review feedback.

### 8.11 — Final Production Deployment & Smoke Test

**Deployment checklist:**
- All tests pass in CI
- All environment variables set on Railway production
- Database migrations applied
- Custom domain SSL working
- Clerk production keys configured

**Smoke test:**
1. Load landing page — verify content, design, CTA
2. Complete full assessment flow
3. Verify results page loads with correct scores
4. Verify email received
5. Verify Brevo contact created
6. Admin dashboard — verify assessment appears
7. Trigger a test error — verify Sentry captures it
8. Check GA4 — verify events flowing

---

## Technical Architecture

- **Tests:**
  - `src/__tests__/` — unit tests (Vitest)
  - `tests/e2e/` — E2E tests (Playwright)
  - `tests/e2e/assessment-flow.e2e.ts`
  - `tests/e2e/admin-dashboard.e2e.ts`
  - `tests/e2e/results-page.e2e.ts`
- **Test data:**
  - `tests/fixtures/assessment-profiles.ts` — 10 test profiles for AI calibration
  - `tests/fixtures/seed-data.ts` — database seed for E2E tests
- **Scripts:**
  - `scripts/calibrate-ai.ts` — runs AI scoring across test profiles and reports consistency

---

## Dependencies

- **Upstream:** All phases (0-7) must be complete
- **Downstream:** None — this is the final phase before launch

---

## Out of Scope

- Load testing / stress testing
- Automated visual regression testing
- Uptime monitoring setup (post-launch)
- User analytics dashboard (post-launch)
- A/B testing infrastructure
