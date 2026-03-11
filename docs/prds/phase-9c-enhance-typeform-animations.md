# PRD: Phase 9C — Enhance Typeform-Style Animations

## Overview

**Phase:** 9C
**Title:** Enhance Typeform-Style Form Animations & Transitions
**Goal:** Close the gap between the current section-level transitions and
a polished Typeform-style experience with staggered question animations,
exit transitions, error shake feedback, and button microinteractions.
**Priority:** Medium — UX polish, not a functional blocker
**Estimated Effort:** 1 day
**Depends On:** Phase 2 (Assessment Form), Phase 9A (reCAPTCHA fix)

---

## Problem Statement

The Phase 2 PRD (Section 2.8) specifies five animation categories:

| PRD Requirement | Current Status |
|----------------|----------------|
| Section slide transitions (300ms) | Implemented — working |
| Progress bar animated fill | Implemented — working |
| Question fade-in appearance | Partially implemented — all questions in a section appear simultaneously with `animate-fade-in` |
| Error shake on validation | Defined in CSS but **never applied** to any component |
| Button hover scale + active press | **Not implemented** — buttons only have colour transitions |

Users report that "typeform style animations/transitions for each question
do not appear to be working/implemented." While section-level transitions
exist, the PRD specifies a more granular, polished experience that
matches Typeform's signature one-at-a-time reveal pattern.

---

## Success Criteria (Definition of Done)

- [ ] Questions within a section appear with staggered fade-in delays
      (each question 100ms after the previous)
- [ ] Current section animates out before the next section animates in
      (exit + enter transition pair)
- [ ] Validation errors trigger a shake animation on the invalid field
- [ ] Primary buttons have hover scale (1.02) and active press (0.98)
      microinteractions
- [ ] All animations respect `prefers-reduced-motion` user preference
- [ ] Animations use CSS only — no new JavaScript animation libraries
- [ ] Mobile performance unaffected (60fps on mid-range devices)
- [ ] All existing E2E tests pass without timing-related flakiness

---

## Detailed Requirements

### 9C.1 — Staggered Question Fade-In

**Files:** All question components in
`src/components/assessment/questions/`

**Current behaviour:** Every question component has
`className="animate-fade-in"` on its container, causing all questions in
a section to fade in simultaneously (200ms).

**Required changes:**

Add a `style` prop with `animationDelay` based on the question's index
within its section. The delay is passed from the parent
`SectionRenderer`.

**In `SectionRenderer` (`AssessmentForm.tsx`):**
```tsx
{section.questions.map((question, index) => {
  // ... existing conditional logic ...
  return (
    <QuestionDispatcher
      key={question.fieldName}
      question={question}
      animationDelay={index * 100}
    />
  );
})}
```

**In each question component:**
```tsx
<div
  className="animate-fade-in"
  style={{ animationDelay: `${animationDelay}ms` }}
>
```

**Animation tuning:**
- Base delay: 100ms per question
- Maximum delay cap: 500ms (prevents long waits on sections with many
  questions)
- The `animate-fade-in` class already has `animation-fill-mode: forwards`
  and starts at `opacity: 0`, so delayed items remain invisible until
  their animation fires

### 9C.2 — Section Exit Animation

**File:** `src/components/assessment/AssessmentForm.tsx`

**Current behaviour:** When navigating between sections, React's
`key={currentSection}` unmounts the old section and mounts the new one.
The new section slides in, but the old section disappears instantly
(no exit animation).

**Required changes:**

Add a brief exit animation before switching sections. This does NOT
require `framer-motion` — it can be achieved with a CSS class toggle
and a short timeout.

**Approach:**
1. Add an `isExiting` state boolean
2. When `handleNext` or `handleBack` is called (after validation
   passes), set `isExiting = true`
3. Apply an exit animation class to the current section:
   - Forward navigation: `animate-slide-out-left` (slide + fade left)
   - Backward navigation: `animate-slide-out-right` (slide + fade right)
4. After 200ms (exit animation duration), update `currentSection` and
   set `isExiting = false`
5. The new section enters with the existing `animate-slide-in-*` class

**New CSS keyframes** (add to `src/styles/global.css`):
```css
@keyframes slide-out-left {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

@keyframes slide-out-right {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}

.animate-slide-out-left {
  animation: slide-out-left 200ms ease forwards;
}

.animate-slide-out-right {
  animation: slide-out-right 200ms ease forwards;
}
```

**Timing budget:** 200ms exit + 300ms enter = 500ms total transition.
This matches Typeform's perceived transition speed.

### 9C.3 — Error Shake Animation

**Files:** All question components in
`src/components/assessment/questions/`

**Current behaviour:** The `animate-shake` class is defined in
`src/styles/global.css` (lines 100-116) but is never applied to any
component. Validation errors show red text with `animate-fade-in` only.

**Required changes:**

Apply the shake animation to the question container when a validation
error is present for that field.

**Approach in each question component:**

```tsx
const error = errors[name];
const shakeClass = error ? 'animate-shake' : '';

return (
  <div className={`animate-fade-in ${shakeClass}`} style={...}>
```

**Important:** The shake animation must only trigger on NEW errors, not
persist on re-render. Use a `key` prop trick:

```tsx
<div
  key={error ? `${name}-error-${Date.now()}` : name}
  className={`animate-fade-in ${error ? 'animate-shake' : ''}`}
>
```

This forces React to remount (and thus re-trigger the animation) only
when an error appears. When the error clears, the component remounts
without the shake class.

**Alternative (cleaner):** Track a `shakeKey` counter in the form
navigation handler. Increment it when validation fails. Pass it as a
key to the SectionRenderer. This avoids `Date.now()` in render and is
more React-idiomatic.

### 9C.4 — Button Microinteractions

**File:** `src/components/assessment/FormNavigation.tsx`

**Current behaviour:** The "Continue" and "Submit Assessment" buttons
have `hover:bg-accent-blue-hover` colour transition only.

**Required changes:**

Add scale transitions to primary buttons:

```
transition-all duration-150
hover:scale-[1.02]
active:scale-[0.98]
```

Apply to both the "Continue →" and "Submit Assessment" buttons.

Do NOT apply scale to the "← Back" text link — it should remain subtle.

### 9C.5 — Reduced Motion Support

**File:** `src/styles/global.css`

**Required addition:**

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in-right,
  .animate-slide-in-left,
  .animate-slide-out-left,
  .animate-slide-out-right,
  .animate-fade-in,
  .animate-shake {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

This respects users who have enabled "Reduce motion" in their OS
accessibility settings. All animations resolve to their final state
instantly.

### 9C.6 — ConsentCheckbox Animation Delay

**File:** `src/components/assessment/AssessmentForm.tsx`

The `ConsentCheckbox` rendered at the end of the last section
(line 148-150) is outside the `questions.map()` loop and thus doesn't
receive a staggered delay.

**Required change:** Pass `animationDelay` based on the section's
question count:

```tsx
{sectionIndex === assessmentSections.length - 1 && (
  <div
    className="animate-fade-in"
    style={{ animationDelay: `${Math.min(section.questions.length * 100, 500)}ms` }}
  >
    <ConsentCheckbox name="consentChecked" />
  </div>
)}
```

---

## Technical Architecture

### Files Modified

| File | Change |
|------|--------|
| `src/styles/global.css` | Add exit animation keyframes, reduced motion media query |
| `src/components/assessment/AssessmentForm.tsx` | Add exit animation state, staggered delay passing, consent delay |
| `src/components/assessment/FormNavigation.tsx` | Add button scale transitions |
| `src/components/assessment/questions/TextQuestion.tsx` | Add `animationDelay` prop, error shake |
| `src/components/assessment/questions/TextareaQuestion.tsx` | Add `animationDelay` prop, error shake |
| `src/components/assessment/questions/EmailQuestion.tsx` | Add `animationDelay` prop, error shake |
| `src/components/assessment/questions/NumberQuestion.tsx` | Add `animationDelay` prop, error shake |
| `src/components/assessment/questions/RadioCardQuestion.tsx` | Add `animationDelay` prop, error shake |
| `src/components/assessment/questions/MultiSelectQuestion.tsx` | Add `animationDelay` prop, error shake |
| `src/components/assessment/questions/DropdownQuestion.tsx` | Add `animationDelay` prop, error shake |
| `src/components/assessment/questions/ConsentCheckbox.tsx` | Add `animationDelay` prop |

### No New Files Created

All changes are enhancements to existing files.

### No New Dependencies

Pure CSS animations only. No framer-motion, react-spring, or other
animation libraries needed.

### Impact on API/SDK

- **No API changes.** This is a purely visual/UX enhancement.
- **No SDK changes.**
- **No data model changes.**

### Risk Assessment

- **Risk:** Low — CSS-only changes with no logic modifications
- **Blast radius:** Assessment form pages only
- **E2E test impact:** Animations add 200ms exit delay to section
  navigation. E2E tests using `click()` then `waitForSelector()` should
  be unaffected since they wait for elements to appear, not for
  animations to complete. However, verify that no E2E tests depend on
  instant section switching.
- **Performance:** CSS animations are GPU-accelerated (`transform` and
  `opacity` only). No reflows or layout shifts.
- **Rollback:** Revert the single commit

---

## Acceptance Testing

1. **Staggered fade-in:** Navigate to any section with 4+ questions.
   Questions should appear one by one with ~100ms gaps.
2. **Exit animation:** Click "Continue" — current section should slide
   out before the next slides in. Verify both forward and backward
   navigation.
3. **Error shake:** Leave a required field empty and click "Continue".
   The error field should briefly shake horizontally.
4. **Button scale:** Hover over "Continue" button — should grow
   slightly. Click and hold — should shrink slightly.
5. **Reduced motion:** Enable "Reduce motion" in OS settings. All
   animations should be disabled; sections switch instantly.
6. **Mobile (375px):** Complete the full form on mobile viewport.
   Animations should be smooth at 60fps.
7. **Keyboard navigation:** Press Enter to advance. Exit + enter
   animations should play correctly with keyboard-driven navigation.
