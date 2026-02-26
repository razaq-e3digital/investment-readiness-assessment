# PRD: Phase 3 — Assessment Submission & AI Scoring

## Overview

**Phase:** 3
**Title:** Assessment Submission & AI Scoring
**Goal:** Submit the completed assessment form, validate and persist responses, score them with AI via OpenRouter, and redirect the user to their results page.
**Priority:** Critical — core product functionality
**Estimated Effort:** 2–3 days
**Depends On:** Phase 2 (Assessment Form)

---

## Problem Statement

Once a founder completes the assessment form, their responses need to be securely validated, persisted to the database, protected from abuse (bots, spam, rate limiting), scored by an AI model that understands investor readiness criteria, and the user must be redirected to a personalised results page. The AI scoring is the heart of the product — it must be reliable, consistent, and produce actionable insights.

---

## Success Criteria (Definition of Done)

- [ ] Form submits successfully and data is saved to PostgreSQL
- [ ] reCAPTCHA v3 validates submissions (threshold 0.5)
- [ ] Rate limiting blocks more than 3 submissions per hour per IP
- [ ] AI returns structured scores for all 10 categories
- [ ] AI response is validated against Zod schema
- [ ] If AI fails, assessment is saved with `ai_scored: false` for manual review
- [ ] Loading/processing animation displays during AI scoring
- [ ] User is redirected to `/results/[id]` after scoring completes
- [ ] Full pipeline works end-to-end: form → API → AI → results

---

## Detailed Requirements

### 3.1 — POST /api/assessment/submit Endpoint

**Request body:**
```typescript
{
  responses: AssessmentFormData; // All form responses
  contactName: string;
  contactEmail: string;
  contactCompany?: string;
  contactLinkedin?: string;
  contactSource?: string;
  consentChecked: boolean;
  recaptchaToken: string;
}
```

**Server-side validation:**
- Re-validate all form responses with the same Zod schema used client-side
- Validate email format
- Validate consent is checked
- Return 400 with specific validation errors if invalid

**Database write:**
- Generate UUID for assessment
- Save raw responses as JSONB
- Set `ai_scored: false` initially
- Hash IP address with SHA-256 before storing
- Save reCAPTCHA score

**Response:**
```typescript
// Success (after AI scoring)
{ success: true, assessmentId: string, redirectUrl: string }

// Success (AI failed, manual review)
{ success: true, assessmentId: string, redirectUrl: string, aiPending: true }

// Validation error
{ success: false, errors: Record<string, string> }

// Rate limited
{ success: false, error: 'rate_limited', retryAfter: number }

// reCAPTCHA failed
{ success: false, error: 'captcha_failed' }
```

### 3.2 — reCAPTCHA v3 Integration

**Client-side:**
- Load reCAPTCHA v3 script on the assessment page
- Generate invisible token on form submission (action: `assessment_submit`)
- Send token with submission request

**Server-side:**
- Verify token with Google reCAPTCHA API
- Threshold: 0.5 (below this = likely bot)
- Store score on assessment record
- If verification fails: return 403, do not save assessment
- If score below threshold: save assessment but flag for review, still score with AI

**Environment variables required:**
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6L...
RECAPTCHA_SECRET_KEY=6L...
```

**MANUAL STEP:** Create reCAPTCHA v3 site in Google reCAPTCHA admin console, obtain keys.

### 3.3 — Rate Limiting Middleware

**Rules:**
- Maximum 3 assessment submissions per hour per IP address
- IP is hashed with SHA-256 (never store raw IPs)
- Window: rolling 1-hour window

**Implementation:**
- Check `rate_limits` table for IP hash + `assessment_submit` action
- Count submissions in the last hour
- If count >= 3: return 429 with `retryAfter` header
- If under limit: increment count and proceed

**Rate limit response:**
```json
{
  "success": false,
  "error": "rate_limited",
  "message": "Too many submissions. Please try again later.",
  "retryAfter": 1800
}
```

### 3.4 — OpenRouter AI Scoring Integration

**API Integration:**
- Use OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`)
- Model: `anthropic/claude-sonnet-4` (or configurable via env var)
- API key via environment variable

**Prompt Construction:**
Build a structured prompt that:
1. Sets the AI's role as an experienced investor/VC analyst
2. Provides the 10 assessment categories with scoring criteria
3. Includes the founder's responses (formatted clearly)
4. Requests a structured JSON response

**Prompt template (high-level):**
```
You are an experienced startup investment analyst. Evaluate this founder's
investor readiness based on their assessment responses.

Score each of the following 10 categories from 0-100:
1. Problem-Market Fit
2. Product & Traction
3. Business Model
4. Team
5. Financials
6. Go-to-Market
7. Legal & IP
8. Investment Readiness
9. Metrics & Data
10. Vision & Scalability

For each category, provide:
- score (0-100)
- brief justification (1-2 sentences)
- specific recommendation

Also provide:
- Overall weighted score (0-100)
- Readiness level: "investment_ready" (70-100), "nearly_there" (50-69),
  "early_stage" (25-49), "too_early" (0-24)
- Top 3 gaps (title, current state, recommended actions)
- 3 quick wins (actionable items they can do this week)
- 3 medium-term recommendations (1-3 month timeframe)

IMPORTANT: Respond ONLY with valid JSON matching this exact structure.

[Founder's responses inserted here]
```

**Environment variables required:**
```
OPENROUTER_API_KEY=sk-or-...
AI_MODEL=anthropic/claude-sonnet-4
```

**MANUAL STEP:** Create OpenRouter account, add credits, obtain API key.

### 3.5 — AI Response Validation

**Zod schema for AI response:**
```typescript
const AIScoringResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  readinessLevel: z.enum(['investment_ready', 'nearly_there', 'early_stage', 'too_early']),
  categories: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100),
    justification: z.string(),
    recommendation: z.string(),
  })).length(10),
  topGaps: z.array(z.object({
    title: z.string(),
    currentState: z.string(),
    recommendedActions: z.array(z.string()),
  })).min(1).max(3),
  quickWins: z.array(z.string()).min(1).max(5),
  mediumTermRecommendations: z.array(z.string()).min(1).max(5),
});
```

**Validation logic:**
- Parse AI response as JSON (strip markdown code fences if present)
- Validate against Zod schema
- If validation fails: retry once with a "fix your JSON" prompt
- If second attempt fails: fall back to manual review (3.6)
- Log all validation failures to Sentry

### 3.6 — Fallback: Manual Review Queue

**Triggers:**
- OpenRouter API timeout (>30 seconds)
- OpenRouter API error (5xx, rate limited)
- AI response fails Zod validation after retry
- Any unexpected error during scoring

**Behaviour:**
- Save assessment with `ai_scored: false`
- Still redirect user to results page
- Results page shows: "Your assessment is being reviewed. We'll email your detailed results within 24 hours."
- Log the failure in Sentry with full context
- Admin dashboard (Phase 7) will show unscored assessments

### 3.7 — Processing/Loading Animation Page (Stitch Design)

**Overall layout (from Stitch mockup):**
- Background: `#f1f5f9` (light blue-grey)
- Top navbar:
  - Left: "E3 Digital" logo (blue square icon + text)
  - Right: Status pill badge — "STATUS • Processing" with pulsing dot indicator, in subtle muted style
  - Optional: user avatar circle (far right)
- Content: centred white card, max-width ~480px, `rounded-xl`, `p-8`, `shadow-sm`, border `#e2e8f0`

**Card content (Stitch mockup spec):**
- Top: circular spinner animation — blue accent `#2563eb` spinning ring/arc on light background
- Heading: "Preparing your personalised report..." — `text-xl font-semibold text-[#0f172a]`, centred
- Subtext: "Our AI is analysing your responses against investor readiness criteria. This usually takes 15-30 seconds." — `text-sm text-[#475569]`, centred

**Vertical timeline / step list (Stitch mockup spec):**
- Steps displayed as a vertical list with connecting line on the left
- Each step has:
  - **Completed step:** Green circle with white checkmark icon (`#22c55e` background) + step label in `text-[#0f172a]` + "Complete" badge in green (`text-xs text-[#22c55e]`)
  - **Active step:** Blue spinning circle (`#2563eb`) + step label in `text-[#2563eb]` (blue) + "Processing..." text in blue (`text-xs text-[#2563eb]`)
  - **Pending step:** Grey circle outline (`#e2e8f0`) + step label in muted `text-[#94a3b8]` + "Waiting" text
- Vertical connecting line: thin line (`border-l-2`) between step circles, green for completed segments, grey for pending
- Steps:
  1. "Analyzing responses" → completes quickly (1-2s)
  2. "Scoring 10 criteria" → completes during AI processing
  3. "Generating recommendations" → active during final processing
- Each step transitions from pending → active (blue spinner) → completed (green checkmark) sequentially

**Bottom progress bar:**
- Below the steps, full-width within the card
- `h-2 rounded-full`, track `#e2e8f0`, fill `#2563eb`
- Animated fill progressing as steps complete (e.g. 33% per step)

**Footer:**
- Below the card: "POWERED BY E3 Digital" — `text-xs text-[#94a3b8] uppercase tracking-wider`, centred

**Behaviour:**
- No back button (prevent double submission)
- Steps animate in sequence as real processing happens
- On completion: brief "Complete!" state, then auto-redirect to `/results/[assessmentId]`

**Implementation:**
- Client-side state machine driven by API response or polling
- Submit form → show processing page → poll for completion OR use streaming response
- On completion: auto-redirect to `/results/[assessmentId]`

### 3.8 — End-to-End Submission Pipeline

**Complete flow:**
```
User clicks "Submit Assessment"
  → Client: validate all form data (Zod)
  → Client: generate reCAPTCHA token
  → Client: show loading animation
  → Client: POST /api/assessment/submit
  → Server: check rate limit
  → Server: verify reCAPTCHA
  → Server: validate request body
  → Server: save assessment to DB (ai_scored: false)
  → Server: call OpenRouter AI
  → Server: validate AI response
  → Server: update assessment with scores (ai_scored: true)
  → Server: return { assessmentId, redirectUrl }
  → Client: redirect to /results/[assessmentId]
```

**Error handling:**
- Network error: show retry button on loading page
- Validation error: return to form with errors highlighted
- Rate limited: show message with retry countdown
- reCAPTCHA fail: show generic error, suggest trying again
- AI fail: redirect to results with "pending review" message

---

## Technical Architecture

- **API Route:** `src/app/api/assessment/submit/route.ts`
- **Middleware:** `src/lib/middleware/rate-limit.ts`
- **AI Integration:** `src/lib/ai/scoring.ts` (prompt builder, API call, response parser)
- **Validation:** `src/lib/validation/submission-schema.ts`
- **Components:**
  - `src/components/assessment/ProcessingScreen.tsx`
- **Utils:**
  - `src/lib/recaptcha.ts` (client + server helpers)
  - `src/lib/hash.ts` (SHA-256 IP hashing)

---

## Dependencies

- **Upstream:** Phase 2 (completed form data to submit)
- **Downstream:** Phase 4 (results page displays scored assessment)

---

## Out of Scope

- Email delivery (Phase 5)
- CRM sync (Phase 6)
- Admin review of unscored assessments (Phase 7)
- Retry/re-scoring mechanism for failed AI attempts
