# PRD: Phase 4 — Results Page

## Overview

**Phase:** 4
**Title:** Results Page
**Goal:** Display the AI-generated scorecard with visual score gauges, category breakdowns, gap analysis, recommendations, and a prominent consultation CTA.
**Priority:** Critical — this is where the user gets value and where conversion happens
**Estimated Effort:** 2–3 days
**Depends On:** Phase 3 (Assessment Submission & AI Scoring)

---

## Problem Statement

After completing the assessment and waiting for AI scoring, founders need to see a clear, visually compelling results page that communicates their investor readiness score, highlights their strengths and gaps, provides actionable recommendations, and drives them to book a strategy call with E3 Digital. This page is both the "value delivery" moment and the primary conversion point.

---

## Success Criteria (Definition of Done)

- [ ] Results page loads via public UUID URL (`/results/[id]`)
- [ ] Overall score gauge displays with correct colour coding
- [ ] Readiness level badge shows correct tier
- [ ] All 10 category breakdown bars display with scores
- [ ] Top 3 gaps cards display with recommendations
- [ ] Next steps section shows quick wins and medium-term actions
- [ ] Consultation CTA links to Zoho booking (opens new tab)
- [ ] Sticky mobile CTA works on mobile devices
- [ ] Optional Clerk account creation prompt works
- [ ] Page is publicly accessible (no auth required)
- [ ] "Pending review" state displays if AI scoring failed

---

## Detailed Requirements

### 4.1 — GET /api/assessment/[id] Endpoint

**Route:** `GET /api/assessment/[id]`

**Behaviour:**
- Fetch assessment by UUID from database
- Return full assessment data (scores, gaps, recommendations)
- If assessment not found: return 404
- If assessment exists but `ai_scored: false`: return data with `pending: true` flag
- No authentication required (public URL, UUID is the access token)

**Response shape:**
```typescript
{
  id: string;
  overallScore: number;
  readinessLevel: 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early';
  categoryScores: {
    name: string;
    score: number;
    justification: string;
    recommendation: string;
  }[];
  topGaps: {
    title: string;
    currentState: string;
    recommendedActions: string[];
  }[];
  quickWins: string[];
  mediumTermRecommendations: string[];
  contactName: string;
  contactCompany?: string;
  createdAt: string;
  aiScored: boolean;
}
```

**Security:**
- UUIDs are unguessable (v4), serving as access tokens
- No sensitive data exposed (no email, no raw responses in API response)
- Rate limit API reads: 30 requests per minute per IP (prevent enumeration)

### 4.2 — Results Page Route

**Route:** `/results/[id]` — Server Component

**Page structure:**
- Fetch assessment data server-side (RSC)
- If not found: show 404 page
- If pending review: show "pending" state (see 3.6)
- If scored: render full results

**Meta tags:**
- Dynamic title: "[Name]'s Investor Readiness Score | E3 Digital"
- Description: "See your personalised investor readiness assessment results"
- No indexing (robots: noindex, nofollow) — these are private results

### 4.3 — Score Gauge Component

**Visual:** Semi-circular or circular gauge showing overall score (0-100)

**Colour coding by score range:**
- 70-100: Green (#22c55e) — "Investment Ready"
- 50-69: Amber/Yellow (#f59e0b) — "Nearly There"
- 25-49: Orange (#f97316) — "Early Stage"
- 0-24: Red (#ef4444) — "Too Early"

**Behaviour:**
- Animated fill on page load (counter animation from 0 to score)
- Large score number in the centre
- Score label below (e.g., "out of 100")
- Smooth easing animation (1.5s duration)

### 4.4 — Readiness Level Badge

**Display:** Pill/badge component below the score gauge

**Levels:**
- "Investment Ready" — Green badge, icon: rocket/checkmark
- "Nearly There" — Amber badge, icon: target/arrow
- "Early Stage" — Orange badge, icon: seedling/growth
- "Too Early" — Red badge, icon: compass/map

**Content below badge:**
- 1-2 sentence summary based on level:
  - Investment Ready: "Your startup shows strong fundamentals across key investor criteria. You're well-positioned to approach investors."
  - Nearly There: "You're making good progress, but there are a few areas that need attention before you'll be investor-ready."
  - Early Stage: "You've got the foundations, but significant work is needed across several key areas before approaching investors."
  - Too Early: "Focus on building your product and validating your market before seeking investment. Here's where to start."

### 4.5 — Category Breakdown Bars

**Display:** 10 horizontal bar charts, one per category

**Each bar shows:**
- Category name (left-aligned)
- Score number (right-aligned)
- Horizontal fill bar (colour-coded by score range, same as gauge)
- Animated fill on scroll into view (staggered, 100ms delay between bars)

**Sorting:** Display in descending score order (highest first) to lead with strengths

**Optional:** Click/expand on a bar to see the AI's justification and recommendation for that category

### 4.6 — Top 3 Gaps Cards

**Display:** 3 cards in a row (stacked on mobile)

**Each card contains:**
- Gap title (e.g., "Financial Model Needs Work")
- "Current state" — brief description of where they are now
- "Recommended actions" — bulleted list of 2-3 specific actions
- Card has a subtle left border colour (red/orange/amber based on severity)
- Icon per card (relevant to the gap category)

### 4.7 — Next Steps Section

**Layout:** Two columns (stacked on mobile)

**Column 1: Quick Wins**
- Header: "Do This Week"
- Icon: lightning bolt
- Bulleted list of 3-5 quick wins from AI
- Each item is a concrete, actionable task

**Column 2: Medium-Term Actions**
- Header: "Over the Next 1-3 Months"
- Icon: calendar/roadmap
- Bulleted list of 3-5 medium-term recommendations
- Each item is a strategic action

### 4.8 — Consultation CTA Section

**Design:** Prominent, full-width section with contrasting background

**Content:**
- Headline: "Want Expert Help Getting Investor-Ready?"
- Subheadline: "Book a free 30-minute strategy call with our founder, Razaq Sherif, to discuss your results and create an action plan."
- Primary CTA button: "Book Your Free Strategy Call →"
- Button links to Zoho booking URL (opens in new tab)
- Trust elements: "Free · No obligation · 30 minutes"
- Razaq's photo/avatar (optional)

**Zoho booking URL:** To be provided (environment variable or hardcoded config)

**MANUAL STEP:** Set up Zoho Bookings page, obtain booking URL.

### 4.9 — Sticky Mobile CTA

**Design:** Fixed bottom bar on mobile devices (< 768px)

**Content:**
- "Book Strategy Call" button (full width, primary style)
- Same link as main CTA (Zoho booking)
- Appears after user scrolls past the main CTA section
- Subtle shadow on top edge
- Does not block content reading (reasonable height ~60px)
- Disappears when user scrolls back up to the main CTA section

### 4.10 — Optional Clerk Account Creation

**Placement:** Below the main consultation CTA, above the footer

**Design:** Subtle, secondary section (not the primary focus)

**Content:**
- Headline: "Save Your Results"
- Subheadline: "Create a free account to access your results anytime and track your progress."
- "Create Account" button → opens Clerk sign-up modal/redirect
- "Already have an account? Sign in" link

**Behaviour:**
- After account creation, link the assessment to the Clerk user ID
- PATCH `/api/assessment/[id]/claim` — updates `clerk_user_id` on the assessment
- User's dashboard shows their assessment(s) when logged in
- This is completely optional — does NOT gate results access

---

## Technical Architecture

- **API Route:** `src/app/api/assessment/[id]/route.ts`
- **API Route:** `src/app/api/assessment/[id]/claim/route.ts`
- **Page:** `src/app/results/[id]/page.tsx` (Server Component)
- **Components:**
  - `src/components/results/ScoreGauge.tsx`
  - `src/components/results/ReadinessLevelBadge.tsx`
  - `src/components/results/CategoryBreakdown.tsx`
  - `src/components/results/CategoryBar.tsx`
  - `src/components/results/GapCard.tsx`
  - `src/components/results/NextSteps.tsx`
  - `src/components/results/ConsultationCTA.tsx`
  - `src/components/results/StickyMobileCTA.tsx`
  - `src/components/results/SaveResults.tsx`
  - `src/components/results/PendingReview.tsx`

---

## Dependencies

- **Upstream:** Phase 3 (scored assessment data in database)
- **Downstream:**
  - Phase 5 (email links back to results page)
  - Phase 7 (admin views individual assessments)
  - Phase 8 (testing and polish)

---

## Out of Scope

- Email delivery of results (Phase 5)
- Social sharing of results
- PDF export of results
- Comparison with industry benchmarks
- Historical tracking across multiple assessments
