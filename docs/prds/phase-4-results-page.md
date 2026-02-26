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

### 4.2 — Results Page Route & Layout (Stitch Design)

**Route:** `/results/[id]` — Server Component

**Overall page layout (from Stitch mockup):**
- **Top navbar:**
  - Left: "E3 Digital" logo (blue square icon + text) — consistent branding
  - Centre: nav links — "Dashboard", "Assessment", "Resources", "Community" (link to in-scope pages only; non-existent pages can be greyed out or omitted)
  - Right: "Log Out" text button + user avatar circle
  - If not logged in: show "Login" and "Start Assessment" instead
  - Navbar: solid white background, bottom border `#e2e8f0`

**Page structure:**
- Fetch assessment data server-side (RSC)
- If not found: show 404 page
- If pending review: show "pending" state (see 3.6)
- If scored: render full results

**Meta tags:**
- Dynamic title: "[Name]'s Investor Readiness Score | E3 Digital"
- Description: "See your personalised investor readiness assessment results"
- No indexing (robots: noindex, nofollow) — these are private results

### 4.3 — Score Gauge Hero Section (Stitch Design)

**Layout: Dark navy hero section** (`#0f172a` background), centred content

**Content (from Stitch mockup):**
- **Readiness badge** at top: pill badge above the gauge (e.g. "Nearly There" in green pill with icon) — see 4.4 for badge spec
- **Circular score gauge** centred:
  - Full circle (not semi-circular) with thick arc stroke
  - Arc colour: gradient or solid colour based on score range (see colour coding below)
  - Large score number in the centre: `text-5xl font-bold text-white` — e.g. "72"
  - "SCORE" label below the number, uppercase, `text-xs tracking-wider text-[#94a3b8]`
  - Background arc track: `rgba(255,255,255,0.1)` or subtle dark grey
  - Gauge size: ~200px diameter
- **Heading below gauge:** "Your Investor Readiness Score" — `text-2xl font-bold text-white`, centred
- **Summary paragraph:** 1-2 sentence AI-generated summary — `text-base text-[#94a3b8]`, centred, max-width ~600px
- **"Download Full Report" button:** White outline button with download icon — links to the full results section below (smooth scroll, not PDF)

**Colour coding by score range (for gauge arc):**
- 75-100: Green (`#22c55e`) — "Investment Ready"
- 50-74: Yellow/Amber (`#eab308`) — "Nearly There"
- 25-49: Orange (`#f97316`) — "Early Stage"
- 0-24: Red (`#ef4444`) — "Too Early"

**Behaviour:**
- Animated fill on page load (counter animation from 0 to score, arc fills simultaneously)
- Smooth easing animation (1.5s duration)

### 4.4 — Readiness Level Badge (Stitch Design)

**Display:** Pill/badge positioned above the score gauge in the dark hero section

**Stitch mockup spec:**
- Rounded-full pill: coloured background tint + coloured text + small icon
- Investment Ready: green pill (`bg-[#dcfce7] text-[#22c55e]`), rocket icon
- Nearly There: green/teal pill, target icon
- Early Stage: orange pill (`bg-[#ffedd5] text-[#f97316]`), seedling icon
- Too Early: red pill (`bg-[#fee2e2] text-[#ef4444]`), compass icon
- Padding: `px-4 py-1.5`, `text-sm font-medium`

**Content below badge (in hero section):**
- 1-2 sentence summary based on level:
  - Investment Ready: "Your startup shows strong fundamentals across key investor criteria. You're well-positioned to approach investors."
  - Nearly There: "You're making good progress, but there are a few areas that need attention before you'll be investor-ready."
  - Early Stage: "You've got the foundations, but significant work is needed across several key areas before approaching investors."
  - Too Early: "Focus on building your product and validating your market before seeking investment. Here's where to start."

### 4.5 — Category Breakdown Section (Stitch Design)

**Layout (from Stitch mockup):**
- White card container below the dark hero, `rounded-xl`, border `#e2e8f0`, `p-6`
- Section heading: "Category Breakdown" — `text-xl font-semibold`
- Timestamp: "Last updated: X hours ago" — `text-xs text-[#94a3b8]`, right-aligned or below heading
- **2-column grid layout** (5 rows × 2 columns = 10 categories) on desktop
- Stacked single column on mobile

**Each category bar (Stitch mockup spec):**
- Category name: `text-sm font-medium text-[#0f172a]`
- Score percentage: `text-sm font-semibold` right-aligned, same colour as bar
- Progress bar below: `h-2 rounded-full`, track `#e2e8f0`
- Bar fill colour-coded by score:
  - 75-100: Green `#22c55e`
  - 60-74: Blue `#3b82f6`
  - 40-59: Orange `#f97316`
  - 0-39: Red `#ef4444`
- Each item has vertical spacing (`gap-4` or `space-y-4`)

**Behaviour:**
- Animated fill on scroll into view (staggered, 100ms delay between bars)
- Optional: click to expand and see AI justification + recommendation

### 4.6 — Top 3 Gaps Cards (Stitch Design)

**Layout (from Stitch mockup):**
- Section heading: "Top 3 Gaps to Address" — `text-xl font-semibold`
- 3 cards in a row (stacked on mobile), `gap-6`

**Each card (Stitch mockup spec):**
- White card: border `#e2e8f0`, `rounded-xl`, `p-6`
- Top: emoji or icon (e.g. chart emoji, target emoji, document emoji) — large, `text-2xl`
- Title: `text-lg font-semibold text-[#0f172a]` — e.g. "Financial Model Needs Work"
- Description: `text-sm text-[#475569]` — brief description of the gap and current state
- Bottom: "See Resource →" link in accent blue `text-[#2563eb] text-sm font-medium` — links to relevant recommendation or external resource
- No coloured left border (Stitch mockup uses clean card style with top emoji instead)

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

### 4.8 — Consultation CTA Section (Stitch Design)

**Layout (from Stitch mockup):** Dark navy background section (`#0f172a`), full-width, centred content

**Content:**
- Heading: "Ready to close those gaps?" — `text-3xl font-bold text-white`, centred
- Subheadline: "Book a free strategy call to discuss your results and create a personalised action plan." — `text-base text-[#94a3b8]`, centred
- CTA button: "Book Your Free Strategy Call" — green filled `#10b981`, white text, `rounded-lg px-8 py-3 font-semibold`, centred
- Button links to Zoho booking URL (opens in new tab)
- Optional trust text below: "Free · No obligation · 30 minutes" — `text-xs text-[#94a3b8]`

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
