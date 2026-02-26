# PRD: Phase 1 — Landing Page & Design System

## Overview

**Phase:** 1
**Title:** Landing Page & Design System
**Goal:** Establish the application-wide design system based on Stitch mockups and build the public-facing landing page that drives clicks to "Start Assessment."
**Priority:** Critical — entry point for all traffic, design foundation for all phases
**Estimated Effort:** 2–3 days
**Depends On:** Phase 0 (Boilerplate Setup)
**Design Source:** Stitch mockups (5 screens: landing, form, processing, results, admin)

---

## Problem Statement

The tool needs a compelling, trust-building landing page that clearly communicates what the Investor Readiness Assessment is, how it works, what founders will receive, and why they should trust E3 Digital. The page must convert visitors into assessment-takers. Additionally, the page must be legally compliant (GDPR cookie consent, privacy policy, terms of service) and have analytics tracking from Day 1.

This phase also establishes the design system (colours, typography, component primitives, spacing, dark/light patterns) that all subsequent phases will follow.

---

## Success Criteria (Definition of Done)

- [ ] Design system tokens (colours, typography, spacing, radii, shadows) are configured in Tailwind
- [ ] Shared component primitives (cards, buttons, badges, progress bars) match Stitch designs
- [ ] Landing page matches the Stitch landing page mockup precisely
- [ ] GA4 tracking fires page view and CTA click events
- [ ] Cookie consent banner works (blocks GA4 until consent given)
- [ ] Privacy Policy and Terms of Service pages are linked and accessible
- [ ] Page scores > 90 on Lighthouse performance
- [ ] Mobile responsive (tested at 375px, 768px, 1024px, 1440px)
- [ ] "Start Assessment" CTA is prominent and clickable

---

## Detailed Requirements

### 1.1 — Design System (from Stitch Mockups)

Establish a comprehensive design system in `tailwind.config.ts` and shared CSS/component files. These tokens and patterns are used across ALL phases.

#### Colour Palette

```
Primary / Navy:       #0f172a  (dark navy, used for hero backgrounds, sidebar, dark sections)
Primary Foreground:   #ffffff  (white text on dark backgrounds)
Accent / Blue:        #2563eb  (CTA buttons, active states, links, progress bars)
Accent Hover:         #1d4ed8  (button hover state)
Accent Light:         #dbeafe  (light blue backgrounds for tags/badges)

Surface / Card:       #ffffff  (card backgrounds)
Background:           #f8fafc  (page background, light blue-grey)
Border:               #e2e8f0  (card borders, dividers)
Border Light:         #f1f5f9  (subtle separators)

Text Primary:         #0f172a  (headings, strong text)
Text Secondary:       #475569  (body text, descriptions)
Text Muted:           #94a3b8  (helper text, timestamps, placeholders)

Score Green:          #22c55e  (high scores 75-100, success states, checkmarks)
Score Green BG:       #dcfce7  (green badge/tag background)
Score Blue:           #3b82f6  (good scores 60-74, active/in-progress states)
Score Blue BG:        #dbeafe  (blue badge/tag background)
Score Orange:         #f97316  (medium scores 40-59, warning states)
Score Orange BG:      #ffedd5  (orange badge/tag background)
Score Red:            #ef4444  (low scores 0-39, error states)
Score Red BG:         #fee2e2  (red badge/tag background)

CTA Green:            #10b981  (secondary CTA buttons, e.g. "Book Strategy Call")
CTA Green Hover:      #059669
```

#### Typography

```
Font Family:          Inter (Google Fonts) — all text, headings and body
Heading 1 (Hero):     text-5xl (48px) font-bold leading-tight tracking-tight
Heading 2 (Section):  text-3xl (30px) font-bold
Heading 3 (Card):     text-xl (20px) font-semibold
Body:                 text-base (16px) font-normal leading-relaxed
Body Small:           text-sm (14px) font-normal
Caption/Label:        text-xs (12px) font-medium uppercase tracking-wider
```

#### Spacing & Layout

```
Page max-width:       max-w-7xl (1280px) centered with px-4 sm:px-6 lg:px-8
Section padding:      py-16 md:py-24
Card padding:         p-6
Card gap:             gap-6 or gap-8
Grid:                 8px base grid
Container:            Centered with consistent horizontal padding
```

#### Component Primitives

**Cards:**
- Background: white (`#ffffff`)
- Border: 1px solid `#e2e8f0`
- Border radius: `rounded-xl` (12px)
- Shadow: `shadow-sm` (subtle)
- Padding: `p-6`
- Hover state (interactive cards): slight shadow increase or border colour change

**Buttons — Primary:**
- Background: `#2563eb` (accent blue)
- Text: white, `font-semibold`
- Padding: `px-6 py-3`
- Border radius: `rounded-lg` (8px)
- Hover: `#1d4ed8`
- With right arrow: "Start Assessment →"

**Buttons — Secondary/Outline:**
- Background: transparent
- Border: 1px solid white (on dark backgrounds) or `#e2e8f0` (on light)
- Text: white or `#0f172a`
- Same padding and radius as primary

**Buttons — Green CTA:**
- Background: `#10b981`
- Text: white, `font-semibold`
- Used for: "Book Strategy Call", secondary conversion actions

**Badges/Pills:**
- Small rounded-full pills with coloured background + text
- Score-based colouring: green/blue/orange/red per score range
- Padding: `px-3 py-1`, `text-xs font-medium`

**Progress Bars:**
- Background track: `#e2e8f0`
- Fill: `#2563eb` (blue) by default, or score-coloured
- Height: `h-2` (8px), `rounded-full`

**Icon Circles:**
- Coloured background circle (pastel) with darker icon
- Size: `w-10 h-10` or `w-12 h-12`
- Border radius: `rounded-xl` (12px) for square-ish, `rounded-full` for circular
- Used in: How It Works steps, What You'll Get cards, KPI cards, gap cards

#### Dark Section Pattern

Used for: Hero, Final CTA, Results hero, Admin sidebar

- Background: `#0f172a` (navy) or gradient from `#0f172a` to `#1e293b`
- Text: white primary, `#94a3b8` secondary
- Cards on dark: slight white/10 border or `bg-white/5` background
- CTA buttons on dark: blue filled or green filled

#### Light Section Pattern

Used for: How It Works, What You'll Get, FAQ, form pages, admin content area

- Background: `#f8fafc` or `#ffffff`
- Text: `#0f172a` primary, `#475569` secondary
- Cards: white with border

---

### 1.2 — Landing Page Layout (Stitch Design)

**Branding:** "E3 Digital" used consistently across all screens.

**Sections (top to bottom):**

#### 1. Navigation Bar
- **Left:** E3 Digital logo — blue square icon + "E3 Digital" text in white (on dark hero) / dark (on scrolled solid background)
- **Centre:** Nav links — "How it works", "Benefits", "FAQ" (smooth scroll to sections on page)
- **Right:** "Login" text link + "Start Assessment" blue filled button
- **Behaviour:** Sticky on scroll, transparent over hero → solid white/navy background on scroll
- **Mobile:** Hamburger menu

#### 2. Hero Section (Dark Navy Background)
- **Layout:** Two-column on desktop. Left column: text content. Right column: score gauge preview graphic.
- **Tag above headline:** Light blue pill badge — "For Non-Technical Founders"
- **Headline:** "How Investor-Ready Is Your Startup?" — "Startup?" in accent blue or green highlight
- **Subheadline:** "Get a free, AI-powered evaluation of your B2B SaaS venture's readiness for investment in under 10 minutes." — in `#94a3b8` (muted text on dark)
- **CTA Row:**
  - Primary button: "Start Free Assessment →" (blue filled, `#2563eb`)
  - Secondary button: "View Sample Report" (white outline) — links to a static example results page at `/results/sample`
- **Social proof line:** Avatar stack (3-4 overlapping circles) + "Used by 1,000+ founders" text
- **Right column:** Score gauge preview showing a sample score (e.g. "82") with a semi-circular coloured arc and a green "Investor Ready" status badge below. This is a static decorative illustration, not functional.
- **Background:** Solid `#0f172a` navy, or subtle gradient to `#1e293b`

#### 3. How It Works Section (Light Background)
- **Heading:** "How It Works" centred
- **Layout:** 3 cards in a row (stacked on mobile)
- **Each card:**
  - Numbered step ("1", "2", "3") — large text or in a coloured circle
  - Icon in a pastel-coloured circle background (blue, green, purple)
  - Title: "Answer Questions" / "Get Analyzed" / "Receive Report"
  - Description: 1-2 line explanation
- **Card style:** White card, border, `rounded-xl`, `p-6`, centered content

#### 4. What You'll Get Section (Light Background)
- **Layout:** Two-column. Left: text description. Right: 2×2 card grid.
- **Left column:**
  - Heading: "What You'll Get"
  - Subheading: "Comprehensive insights to strengthen your fundraising position"
  - Bulleted checklist with green checkmarks:
    - Personalised readiness score out of 100
    - 10-category breakdown of investor criteria
    - Top 3 gaps with specific recommendations
    - Quick wins you can implement this week
  - CTA link: "See Example Report →" — links to `/results/sample`
- **Right column — 2×2 card grid:**
  - Card 1: "Readiness Score" — icon with blue/purple pastel background
  - Card 2: "Gap Analysis" — icon with orange/amber pastel background
  - Card 3: "Financial Health Check" — icon with green pastel background
  - Card 4: "Pitch Deck Audit" — icon with pink/red pastel background
  - Each card: icon in coloured circle, title, 1-line description, white card with border

#### 5. FAQ Section (Light Background)
- **Heading:** "Frequently Asked Questions" centred
- **Subheading:** "Everything you need to know about the assessment" centred, muted text
- **Layout:** Centered column, max-width ~768px
- **Accordion items** (Shadcn Accordion, collapsible, single-open):
  - "How long does the assessment take?"
  - "Is it really free?"
  - "What happens with my data?"
  - "How accurate is the AI scoring?"
- **Accordion style:** Clean borders between items, chevron right icon that rotates on expand, answer text in muted colour

#### 6. Final CTA Section (Dark Navy Background)
- **Heading:** "Ready to see where you stand?" — white text, centred
- **Subheading:** Brief encouragement line in muted text
- **CTA button:** "Start Assessment" (blue filled, centred)
- **Full-width dark navy banner**

#### 7. Footer (Dark Navy Background, continuation of CTA section or separate)
- **Layout:** 4-column grid on desktop, stacked on mobile
- **Column 1:** E3 Digital logo + brief tagline + social media icons row (LinkedIn, Twitter/X)
- **Column 2 — "Product":** Assessment, How it works, FAQ (links to in-scope pages only)
- **Column 3 — "Resources":** Privacy Policy, Terms of Service (in-scope legal pages only)
- **Column 4 — "Company":** About (links to e3.digital), Contact (mailto:razaq@e3.digital)
- **Bottom bar:** "© 2025 E3 Digital. All rights reserved." left, "Privacy Policy · Terms of Service" right
- **Style:** Dark navy background, white/muted text, subtle link hover underline

**IMPORTANT — Omissions from mockup per decisions:**
- **No accelerator trust badges** (YC, Techstars, etc.) — removed until real social proof is available
- **No "Pricing" link** — billing was removed in Phase 0
- **"View Sample Report" and "See Example Report"** — link to `/results/sample` (a static example results page, not PDF generation)
- **Nav links limited to in-scope pages only** — no Blog, Careers, Community, etc.

---

### 1.3 — Sample Results Page

Create a static sample results page at `/results/sample` to serve as the "View Sample Report" destination from the landing page.

- Reuse the results page layout from Phase 4 with hardcoded sample data
- Sample data: a realistic assessment with score ~82, "Investor Ready" status
- All components render statically (gauge, category bars, gap cards)
- Banner at top: "This is a sample report. Start your own assessment to get personalised results." with CTA button
- This page is built as a placeholder in Phase 1; it will be refined when the full results page is built in Phase 4

**Implementation:** Create `src/app/results/sample/page.tsx` with hardcoded data and simplified score display components. Full animated components come in Phase 4.

---

### 1.4 — Social Proof / Credibility

- Razaq Sherif's name and title: "Razaq Sherif, Founder at E3 Digital"
- Brief credibility line: "Helping founders prepare for investment"
- LinkedIn profile link (opens in new tab): `https://www.linkedin.com/in/razaqsherif/`
- Integrated subtly into the hero social proof line or as a small strip between sections
- No separate full-width section needed — keep it subtle and trust-building

---

### 1.5 — Google Analytics 4 Tracking

**Requirements:**
- Add GA4 tracking script to the application
- Use `next/script` with `strategy="afterInteractive"`
- Track events:
  - `page_view` (automatic with GA4)
  - `cta_click` — when "Start Assessment" is clicked (custom event)
  - `faq_expand` — when FAQ item is opened (custom event)
- GA4 must only fire AFTER cookie consent is granted (1.6)

**Environment variables required:**
```
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**MANUAL STEP:** Create GA4 property in Google Analytics, obtain Measurement ID.

---

### 1.6 — Cookie Consent Banner

**Requirements:**
- Banner appears at bottom of page on first visit
- Text: "We use cookies to analyse site traffic and improve your experience."
- Buttons: "Accept" | "Decline" | "Learn More" (links to Privacy Policy)
- Store consent in `localStorage` (key: `cookie-consent`)
- If declined: GA4 script does not load
- If accepted: GA4 script loads
- Banner does not reappear once user has made a choice
- **Style:** Match design system — white card, rounded, shadow, positioned fixed bottom with padding
- Accessible: keyboard navigable, screen reader compatible

---

### 1.7 — Privacy Policy and Terms of Service Pages

**Privacy Policy (`/privacy`):**
- Data controller: E3 Digital
- What data is collected: assessment responses, contact info, email, IP (hashed), browser info
- Why: to provide the assessment service, send results via email, improve the tool
- Third-party services: Clerk (auth), Railway (hosting), Mailgun (email), Brevo (CRM), OpenRouter (AI scoring), Google Analytics, Sentry (error monitoring)
- Data retention: Assessment data retained for 2 years, can be deleted on request
- User rights: access, correction, deletion, portability (GDPR)
- Contact: razaq@e3.digital

**Terms of Service (`/terms`):**
- Service description: free AI-powered investor readiness assessment
- No guarantee of investment outcomes
- AI scoring is directional guidance, not financial advice
- E3 Digital not responsible for business decisions made based on results
- Right to modify or discontinue the service
- Governing law: England and Wales

**Implementation:**
- Static pages with clean typography
- Consistent layout with main site (Navbar + Footer)
- Last updated date displayed
- Back link to landing page

---

## User Flow

```
User lands on assess.e3digital.net
  → Cookie consent banner appears (fixed bottom)
  → User reads landing page
  → User clicks "Start Free Assessment →" or "Start Assessment"
  → Redirect to /assessment (Phase 2)

  OR

  → User clicks "View Sample Report" / "See Example Report"
  → Navigate to /results/sample (static sample page)
  → User clicks "Start Your Own Assessment" CTA
  → Redirect to /assessment (Phase 2)
```

---

## Technical Architecture

- **Route:** `src/app/page.tsx` (landing page)
- **Route:** `src/app/privacy/page.tsx`
- **Route:** `src/app/terms/page.tsx`
- **Route:** `src/app/results/sample/page.tsx` (static sample results)
- **Components:**
  - `src/components/landing/Navbar.tsx`
  - `src/components/landing/Hero.tsx`
  - `src/components/landing/HowItWorks.tsx`
  - `src/components/landing/WhatYouGet.tsx`
  - `src/components/landing/FAQ.tsx`
  - `src/components/landing/FinalCTA.tsx`
  - `src/components/landing/Footer.tsx`
  - `src/components/CookieConsent.tsx`
  - `src/components/GoogleAnalytics.tsx`
- **Design system:**
  - `tailwind.config.ts` — extended theme with all design tokens
  - `src/styles/globals.css` — Inter font import, base styles
  - Shared component primitives built with Shadcn UI + Tailwind

---

## Dependencies

- **Upstream:** Phase 0 (deployed skeleton app)
- **Downstream:** Phase 2 (assessment form — linked via CTA button), all subsequent phases (use the design system established here)

---

## Out of Scope

- Assessment form (Phase 2)
- User authentication pages (already handled by Clerk from Phase 0)
- Admin dashboard (Phase 7)
- A/B testing of landing page copy
- PDF report generation
- Blog, pricing, careers, community pages
- Accelerator trust badges / partner logos (deferred until real social proof available)
