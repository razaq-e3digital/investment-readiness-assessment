# PRD: Phase 2 — Assessment Form (Core)

## Overview

**Phase:** 2
**Title:** Assessment Form (Core)
**Goal:** Build the Typeform-style multi-section form that captures founder responses across 10 investment readiness categories.
**Priority:** Critical — this IS the core product
**Estimated Effort:** 3–4 days
**Depends On:** Phase 1 (Landing Page)

---

## Problem Statement

Founders need to answer approximately 40 questions across 10 investment readiness categories. The experience must feel modern, engaging, and low-friction — similar to Typeform — not like a traditional boring web form. Each question should appear one at a time (or one section at a time), with smooth transitions, a visible progress indicator, and inline validation to maintain data quality.

---

## Success Criteria (Definition of Done)

- [ ] Full 10-section form works end-to-end (all ~40 questions)
- [ ] All inputs validate with Zod (inline errors, blocks progression)
- [ ] Progress bar and section indicator display correctly
- [ ] Keyboard navigation works (Enter to advance, Shift+Enter for textareas)
- [ ] Conditional/branching logic works for relevant questions
- [ ] Form animations are smooth (slide transitions, progress bar fill)
- [ ] Mobile responsive (tested at 375px, 768px, 1024px)
- [ ] Form state persists in memory (no data loss on back navigation)
- [ ] Contact info section captures lead data at end

---

## Detailed Requirements

### 2.1 — Form State Management

**Architecture:**
- React Hook Form as the form engine (already in dependencies)
- Single `useForm()` context provider wrapping the entire multi-step form
- All form data stored in a single flat/nested object — never split across multiple form instances
- `FormProvider` at the assessment route layout level

**State shape (high-level):**
```typescript
type AssessmentFormData = {
  // Section 1: Problem-Market Fit
  problemClarity: string; // radio: 'clear' | 'somewhat' | 'unclear'
  targetCustomer: string; // text
  marketSize: string; // radio: 'large' | 'medium' | 'small' | 'unsure'
  competitorAwareness: string; // radio
  uniqueAdvantage: string; // textarea

  // Sections 2-10: Similar pattern...
  // (Full question list below)

  // Contact Info (final section)
  contactName: string;
  contactEmail: string;
  contactCompany: string;
  contactLinkedin: string;
  contactSource: string; // dropdown
  consentChecked: boolean;
};
```

**Key behaviours:**
- Form data is NOT persisted to localStorage (intentional — single session flow)
- Back navigation preserves all previously entered data
- No data is sent to the server until final submission

### 2.2 — Reusable Question Components

Build a library of reusable form question components that accept standardised props:

**Component: `TextQuestion`**
- Props: `name`, `label`, `placeholder`, `helpText?`, `maxLength?`
- Single-line text input
- Character count if `maxLength` provided

**Component: `TextareaQuestion`**
- Props: `name`, `label`, `placeholder`, `helpText?`, `maxLength?`, `rows?`
- Multi-line textarea
- Character count
- Shift+Enter for newline (Enter advances form)

**Component: `EmailQuestion`**
- Props: `name`, `label`, `placeholder`, `helpText?`
- Email input with format validation

**Component: `NumberQuestion`**
- Props: `name`, `label`, `placeholder`, `helpText?`, `min?`, `max?`, `prefix?`, `suffix?`
- Numeric input with optional currency prefix

**Component: `RadioCardQuestion`**
- Props: `name`, `label`, `options: { value, title, description?, icon? }[]`, `helpText?`
- Visual radio cards (not plain radio buttons)
- Each option is a clickable card with title and optional description
- Selected state with brand accent colour border/background

**Component: `MultiSelectQuestion`**
- Props: `name`, `label`, `options: { value, title, description? }[]`, `helpText?`, `min?`, `max?`
- Checkbox-style multi-select cards
- Optional min/max selection limits

**Component: `DropdownQuestion`**
- Props: `name`, `label`, `options: { value, label }[]`, `placeholder?`, `helpText?`
- Select dropdown (use Shadcn Select component)

**Shared styling:**
- All components follow the same visual pattern: large label, helper text below, input below that
- Error messages appear inline below the input in red
- Animated error appearance (slide down + fade in)
- Focus styles match brand accent colour

### 2.3 — Form Navigation

**Progress Bar:**
- Fixed at top of form page
- Shows: current section number / total sections (e.g., "3 of 11")
- Visual progress fill (percentage-based, animated)
- Section name displayed below progress bar

**Section Indicator:**
- Small breadcrumb or dot indicator showing all sections
- Current section highlighted
- Completed sections marked with checkmark
- Click on previous sections to navigate back (not forward)

**Navigation Buttons:**
- "Next →" button (primary style, bottom right)
- "← Back" button (ghost/text style, bottom left)
- On first section: no Back button
- On last section (contact info): "Submit Assessment" button replaces Next

**Keyboard Support:**
- `Enter` key advances to next question/section (except in textareas)
- `Shift+Enter` for newline in textareas
- Arrow keys navigate radio card options
- `Tab` follows logical focus order

### 2.4–2.5 — Assessment Sections (10 Categories + Contact)

**Section 1: Problem-Market Fit** (5 questions)
1. How clearly can you articulate the problem you're solving? — `RadioCard` (Very clearly / Somewhat clearly / Still refining / Not yet defined)
2. Who is your target customer? Describe them in one sentence. — `Textarea`
3. How large is your addressable market? — `RadioCard` (£1B+ / £100M-£1B / £10M-£100M / Under £10M / Haven't estimated)
4. How well do you understand your competitive landscape? — `RadioCard` (Deep understanding / General awareness / Limited research / Haven't looked yet)
5. What is your unique advantage over existing solutions? — `Textarea`

**Section 2: Product & Traction** (5 questions)
1. What stage is your product at? — `RadioCard` (Revenue-generating product / Live product with users / MVP/beta / Prototype / Concept/idea only)
2. Do you have paying customers? — `RadioCard` (Yes, recurring revenue / Yes, some one-off payments / No, but have free users / No users yet)
3. *[If paying customers: Yes]* What is your current MRR/ARR? — `Number` (£ prefix)
4. *[If paying customers: Yes]* What is your customer growth rate (month-over-month)? — `RadioCard` (>20% / 10-20% / 5-10% / <5% / Too early to measure)
5. What evidence of demand do you have? — `MultiSelect` (Paying customers / Signed LOIs / Waitlist signups / Positive user feedback / Market research / None yet)

**Section 3: Business Model** (4 questions)
1. How clear is your revenue model? — `RadioCard` (Clear and validated / Clear but unvalidated / Exploring options / Not yet defined)
2. What is your primary revenue model? — `Dropdown` (SaaS subscription / Marketplace/platform / Transaction fees / Licensing / Advertising / Hardware + software / Services / Other)
3. What are your unit economics? — `RadioCard` (Positive and improving / Break-even / Negative but path to positive / Haven't calculated)
4. How confident are you in your pricing strategy? — `RadioCard` (Very confident - tested / Somewhat confident / Still experimenting / Haven't set pricing)

**Section 4: Team** (4 questions)
1. How many co-founders are on the team? — `RadioCard` (Solo founder / 2 co-founders / 3+ co-founders)
2. Does your team cover all critical functions? (Technical, commercial, domain expertise) — `RadioCard` (Yes, all covered / Most covered, one gap / Significant gaps / Solo covering everything)
3. Have any founders built and exited a company before? — `RadioCard` (Yes, successful exit / Yes, but unsuccessful / No, but relevant industry experience / No prior startup experience)
4. How many full-time team members (including founders)? — `Number`

**Section 5: Financials** (4 questions)
1. Do you have a financial model/forecast? — `RadioCard` (Detailed 3-year model / Basic projections / Rough estimates / No financial model)
2. What is your current monthly burn rate? — `Number` (£ prefix)
3. How many months of runway do you have? — `RadioCard` (12+ months / 6-12 months / 3-6 months / Less than 3 months / Self-funded/no burn)
4. Have you raised any funding before? — `RadioCard` (Yes, institutional (VC/angel) / Yes, grants only / Yes, friends & family / Bootstrapped only)

**Section 6: Go-to-Market** (4 questions)
1. Do you have a go-to-market strategy? — `RadioCard` (Detailed and executing / Planned but not started / High-level ideas / No strategy yet)
2. What are your primary customer acquisition channels? — `MultiSelect` (Content marketing / Paid advertising / Sales team / Partnerships / Product-led growth / Social media / Events/conferences / Referrals / Other)
3. What is your customer acquisition cost (CAC)? — `RadioCard` (Known and optimising / Roughly estimated / Don't know yet)
4. How repeatable is your sales process? — `RadioCard` (Highly repeatable / Somewhat repeatable / Ad hoc / No sales process yet)

**Section 7: Legal & IP** (3 questions)
1. Is your company properly incorporated? — `RadioCard` (Yes, Ltd company / In progress / Not yet)
2. Do you have any intellectual property protection? — `MultiSelect` (Patents filed / Trademarks registered / Trade secrets / Copyright / Open source strategy / No IP protection / Not applicable)
3. Are your key agreements in place? (Founder agreements, employment contracts, IP assignment) — `RadioCard` (All in place / Most in place / Some gaps / Nothing formalised)

**Section 8: Investment Readiness** (4 questions)
1. Do you have a pitch deck? — `RadioCard` (Yes, investor-ready / Yes, but needs work / In progress / No)
2. How clearly can you articulate your funding ask? — `RadioCard` (Clear ask with use of funds / General idea / Not yet defined)
3. What investment stage are you targeting? — `Dropdown` (Pre-seed / Seed / Series A / Grant funding / Angel investment / Not sure)
4. Have you had any investor conversations? — `RadioCard` (Yes, active discussions / Yes, initial meetings / Informal conversations / Not yet)

**Section 9: Metrics & Data** (3 questions)
1. Are you tracking key business metrics? — `RadioCard` (Comprehensive dashboard / Tracking basics / Ad hoc tracking / Not tracking)
2. Which metrics do you track regularly? — `MultiSelect` (MRR/ARR / Customer acquisition cost / Lifetime value / Churn rate / Monthly active users / Conversion rate / Burn rate / None of these)
3. Can you demonstrate growth trends with data? — `RadioCard` (Yes, clear upward trends / Mixed results / Too early for trends / No data)

**Section 10: Vision & Scalability** (3 questions)
1. How big could this become in 5-10 years? — `RadioCard` (£100M+ revenue potential / £10M-£100M / £1M-£10M / Lifestyle business / Haven't thought that far)
2. What is your scalability strategy? — `Textarea` (placeholder: "How will you grow from current stage to 10x, 100x?")
3. What are the biggest risks to your business, and how are you mitigating them? — `Textarea`

**Section 11: Contact Information** (6 fields + consent)
1. Your full name — `Text` (required)
2. Email address — `Email` (required)
3. Company name — `Text` (optional)
4. LinkedIn profile URL — `Text` (optional, URL validation)
5. How did you hear about this tool? — `Dropdown` (LinkedIn / Twitter/X / Google search / Referral / E3 Digital website / Event / Other)
6. Consent checkbox — "I agree to the Privacy Policy and consent to receiving my assessment results via email" (required, links to /privacy)

### 2.6 — Zod Validation

**Per-question validation:**
- Required fields cannot be empty (custom error: "Please answer this question")
- Text fields: min 10 characters for textareas, max 500 characters
- Email: valid email format
- Number: positive numbers only, reasonable ranges
- Radio: must select an option
- MultiSelect: minimum 1 selection where required
- LinkedIn URL: must match linkedin.com pattern (if provided)
- Consent: must be checked

**Validation behaviour:**
- Validate current section on "Next" click
- Show inline error on the failing question
- Scroll to first error
- Do NOT validate sections the user hasn't reached yet
- Error message disappears when user starts correcting

### 2.7 — Conditional/Branching Logic

- Section 2, Q2 → If "Yes" to paying customers → show Q3 (MRR) and Q4 (growth rate)
- Section 2, Q2 → If "No" → skip Q3 and Q4, go to Q5
- Any other conditional logic as determined by question flow

**Implementation:**
- Use React Hook Form's `watch()` to observe conditional field values
- Conditionally render follow-up questions
- Skip validation for hidden questions
- Adjust progress bar to account for skipped questions

### 2.8 — Form Animations

- **Section transitions:** Slide left/right animation when navigating between sections (CSS transform + opacity, 300ms ease)
- **Progress bar:** Animated fill width on section change
- **Question appearance:** Subtle fade-in when a new question appears
- **Error shake:** Brief horizontal shake animation on validation error
- **Button states:** Hover scale, active press, loading spinner on submit

**Implementation:** Use CSS transitions/animations. No heavy animation library needed. Consider `framer-motion` only if CSS isn't sufficient.

---

## Technical Architecture

- **Route:** `src/app/assessment/page.tsx` — assessment form page
- **Layout:** `src/app/assessment/layout.tsx` — FormProvider wrapper, progress bar
- **Components:**
  - `src/components/assessment/AssessmentForm.tsx` — main form orchestrator
  - `src/components/assessment/ProgressBar.tsx`
  - `src/components/assessment/SectionIndicator.tsx`
  - `src/components/assessment/FormNavigation.tsx`
  - `src/components/assessment/questions/TextQuestion.tsx`
  - `src/components/assessment/questions/TextareaQuestion.tsx`
  - `src/components/assessment/questions/EmailQuestion.tsx`
  - `src/components/assessment/questions/NumberQuestion.tsx`
  - `src/components/assessment/questions/RadioCardQuestion.tsx`
  - `src/components/assessment/questions/MultiSelectQuestion.tsx`
  - `src/components/assessment/questions/DropdownQuestion.tsx`
- **Data:**
  - `src/data/assessment-questions.ts` — all questions, sections, options as typed data
- **Validation:**
  - `src/lib/validation/assessment-schema.ts` — Zod schemas per section

---

## Dependencies

- **Upstream:** Phase 1 (landing page CTA links to `/assessment`)
- **Downstream:** Phase 3 (form submission sends data to API)

---

## Out of Scope

- Form data persistence to localStorage/server (single session only)
- Save and resume later functionality
- AI scoring (Phase 3)
- Results display (Phase 4)
- Email delivery (Phase 5)
