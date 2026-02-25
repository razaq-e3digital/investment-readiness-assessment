# PRD: Phase 1 — Landing Page

## Overview

**Phase:** 1
**Title:** Landing Page
**Goal:** Build a public-facing page that explains the Investor Readiness Assessment tool and drives clicks to "Start Assessment."
**Priority:** Critical — entry point for all traffic
**Estimated Effort:** 1–2 days
**Depends On:** Phase 0 (Boilerplate Setup)

---

## Problem Statement

The tool needs a compelling, trust-building landing page that clearly communicates what the Investor Readiness Assessment is, how it works, what founders will receive, and why they should trust E3 Digital. The page must convert visitors into assessment-takers. Additionally, the page must be legally compliant (GDPR cookie consent, privacy policy, terms of service) and have analytics tracking from Day 1.

---

## Success Criteria (Definition of Done)

- [ ] Landing page is live on `assess.e3digital.net`
- [ ] GA4 tracking fires page view and CTA click events
- [ ] Cookie consent banner works (blocks GA4 until consent given)
- [ ] Privacy Policy and Terms of Service pages are linked and accessible
- [ ] Page scores > 90 on Lighthouse performance
- [ ] Mobile responsive (tested at 375px, 768px, 1024px, 1440px)
- [ ] "Start Assessment" CTA is prominent and clickable

---

## Detailed Requirements

### 1.1 — Landing Page Layout

**Sections (top to bottom):**

1. **Navigation Bar**
   - E3 Digital logo (left)
   - "Sign In" link (right, for returning users → `/sign-in`)
   - Sticky on scroll
   - Transparent background → solid on scroll

2. **Hero Section**
   - Headline: "How Ready Is Your Startup for Investment?"
   - Subheadline: "Get a free, AI-powered assessment of your investor readiness in under 10 minutes. Receive a personalised scorecard with actionable recommendations."
   - Primary CTA button: "Start Your Free Assessment →" → links to `/assessment`
   - Secondary text: "Takes ~8 minutes · 100% free · Instant AI-powered results"
   - Optional: subtle background pattern or gradient (aligned with E3 Digital brand)

3. **How It Works Section**
   - 3-step visual flow:
     1. "Answer 40 questions across 10 key categories" (icon: clipboard/form)
     2. "Our AI analyses your responses against investor criteria" (icon: brain/AI)
     3. "Get your personalised scorecard with actionable next steps" (icon: chart/results)
   - Each step has an icon, title, and 1-line description

4. **What You'll Receive Section**
   - Bullet list or card grid:
     - Overall investor readiness score (0-100)
     - Category-by-category breakdown (10 categories)
     - Your top 3 investment gaps with specific recommendations
     - Quick wins you can implement immediately
     - Personalised next steps for your stage
   - Visual mockup or preview of the results page (optional)

5. **Who This Is For Section**
   - "Built for founders who are:"
     - Thinking about raising their first round
     - Preparing for investor conversations
     - Want to understand what investors look for
     - Building in the UK startup ecosystem
   - "Not sure if you're ready? That's exactly why this tool exists."

6. **Social Proof / Credibility Strip**
   - Razaq Sherif, Founder at E3 Digital
   - Brief credibility line: "Helping founders prepare for investment since [year]"
   - LinkedIn link to Razaq's profile
   - Optional: E3 Digital client logos or testimonials (if available)

7. **FAQ Section**
   - Collapsible accordion (Shadcn Accordion component)
   - Questions:
     - "How long does the assessment take?" → ~8-10 minutes
     - "Is it really free?" → Yes, completely free. No hidden costs.
     - "What happens with my data?" → Link to privacy policy, data used only for assessment
     - "How accurate is the AI scoring?" → Based on real investor criteria, provides directional guidance
     - "Can I retake the assessment?" → Yes, you can take it again as your startup progresses
     - "Do I need to create an account?" → No, results are available immediately. Account is optional to save results.

8. **Final CTA Section**
   - Headline: "Ready to Find Out Where You Stand?"
   - CTA button: "Start Your Free Assessment →" → links to `/assessment`
   - Reassurance text: "No account required · Results in minutes · 100% confidential"

9. **Footer**
   - © 2025 E3 Digital. All rights reserved.
   - Links: Privacy Policy | Terms of Service | Contact
   - "Built by E3 Digital" with link to e3.digital
   - Social links (LinkedIn)

### 1.2 — E3 Digital Brand Design System

**Apply to Tailwind config (`tailwind.config.ts`):**

- **Primary colour:** To be confirmed from Stitch designs (default: deep blue/navy `#1a1a2e` or similar)
- **Accent colour:** To be confirmed (default: vibrant blue/electric `#4361ee` or similar)
- **Success colour:** Green for high scores
- **Warning colour:** Amber for medium scores
- **Danger colour:** Red for low scores
- **Background:** Clean white / light grey
- **Text:** Dark charcoal `#1a1a1a` for body, slightly lighter for secondary text
- **Typography:**
  - Headings: Inter (bold/semibold) or brand font
  - Body: Inter (regular)
  - Font sizes: Follow a consistent type scale
- **Spacing:** 8px grid system
- **Border radius:** Consistent rounded corners (8px for cards, 6px for buttons)
- **Shadows:** Subtle, modern shadows for cards and elevated elements

**MANUAL STEP:** Obtain exact brand colours, fonts, and design assets from Stitch/E3 Digital brand guidelines.

### 1.3 — Social Proof

- Razaq Sherif's name and title
- LinkedIn profile link (opens in new tab): `https://www.linkedin.com/in/razaqsherif/`
- Brief founder credibility strip
- Styled as a subtle, trust-building element (not overly promotional)

### 1.4 — Google Analytics 4 Tracking

**Requirements:**
- Add GA4 tracking script to the application
- Use `next/script` with `strategy="afterInteractive"`
- Track events:
  - `page_view` (automatic with GA4)
  - `cta_click` — when "Start Assessment" is clicked (custom event)
  - `faq_expand` — when FAQ item is opened (custom event)
- GA4 must only fire AFTER cookie consent is granted (1.5)

**Environment variables required:**
```
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**MANUAL STEP:** Create GA4 property in Google Analytics, obtain Measurement ID.

### 1.5 — Cookie Consent Banner

**Requirements:**
- Banner appears at bottom of page on first visit
- Text: "We use cookies to analyse site traffic and improve your experience."
- Buttons: "Accept" | "Decline" | "Learn More" (links to Privacy Policy)
- Store consent in `localStorage` (key: `cookie-consent`)
- If declined: GA4 script does not load
- If accepted: GA4 script loads
- Banner does not reappear once user has made a choice
- Styled to match brand design system
- Must not block page content (position: fixed bottom)
- Accessible: keyboard navigable, screen reader compatible

### 1.6 — Privacy Policy and Terms of Service Pages

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
- Consistent layout with main site
- Last updated date displayed
- Back link to landing page

---

## User Flow

```
User lands on assess.e3digital.net
  → Cookie consent banner appears
  → User reads landing page
  → User clicks "Start Your Free Assessment →"
  → Redirect to /assessment (Phase 2)
```

---

## Technical Architecture

- **Route:** `src/app/page.tsx` (landing page)
- **Route:** `src/app/privacy/page.tsx`
- **Route:** `src/app/terms/page.tsx`
- **Components:**
  - `src/components/landing/Navbar.tsx`
  - `src/components/landing/Hero.tsx`
  - `src/components/landing/HowItWorks.tsx`
  - `src/components/landing/WhatYouGet.tsx`
  - `src/components/landing/WhoItsFor.tsx`
  - `src/components/landing/SocialProof.tsx`
  - `src/components/landing/FAQ.tsx`
  - `src/components/landing/FinalCTA.tsx`
  - `src/components/landing/Footer.tsx`
  - `src/components/CookieConsent.tsx`
  - `src/components/GoogleAnalytics.tsx`

---

## Dependencies

- **Upstream:** Phase 0 (deployed skeleton app)
- **Downstream:** Phase 2 (assessment form — linked via CTA button)

---

## Out of Scope

- Assessment form (Phase 2)
- User authentication pages (already handled by Clerk from Phase 0)
- Admin dashboard (Phase 7)
- A/B testing of landing page copy
