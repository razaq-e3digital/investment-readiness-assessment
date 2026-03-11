# PRD: Phase 9A — Fix reCAPTCHA Resilience

## Overview

**Phase:** 9A
**Title:** Fix reCAPTCHA Integration Resilience
**Goal:** Ensure assessment form submission never fails due to reCAPTCHA misconfiguration, invalid keys, or script loading failures.
**Priority:** Critical — currently blocking all user submissions in production
**Estimated Effort:** 0.5 days
**Depends On:** Phase 3 (Submission & AI Scoring), Phase 8 (Polish & Testing)

---

## Problem Statement

Users are unable to complete the assessment. When the form is submitted,
nothing happens — the app silently fails. The browser console shows:

```
Uncaught Error: Invalid site key or not loaded in api.js: 6L...
    at Array.<anonymous> (recaptcha__en.js:768:35)
```

**Root cause:** Google's reCAPTCHA v3 script throws an **uncaught exception**
when `grecaptcha.execute()` is called with an invalid or misconfigured site
key. This exception propagates through the promise chain in the assessment
page bundle, preventing the `ProcessingScreen` from ever appearing.

The current defensive code in `src/lib/recaptcha.ts` (`getRecaptchaToken`)
catches errors from `grecaptcha.execute()` and returns `''`, but Google's
script throws the error **inside its own `ready()` callback** before the
`execute()` promise resolves, causing an uncaught error that crashes the
call stack.

**Impact:** 100% of users are blocked from submitting the assessment.

---

## Success Criteria (Definition of Done)

- [ ] Assessment submission works when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
      is empty, invalid, or missing
- [ ] Assessment submission works when reCAPTCHA script fails to load
      (blocked by ad-blocker, network error, CSP)
- [ ] Assessment submission works with a valid, correctly configured
      reCAPTCHA site key
- [ ] No uncaught exceptions appear in the browser console from
      reCAPTCHA integration
- [ ] Server-side verification gracefully skips when token is empty
      (existing behaviour preserved)
- [ ] Sentry captures reCAPTCHA failures as warnings (not errors) for
      monitoring
- [ ] All existing unit and E2E tests pass
- [ ] New unit tests cover all reCAPTCHA failure scenarios

---

## Detailed Requirements

### 9A.1 — Client-Side Error Boundary for reCAPTCHA Script Loading

**File:** `src/lib/recaptcha.ts` — `loadRecaptchaScript()`

**Current behaviour:**
- Creates a `<script>` tag pointing to Google's reCAPTCHA API
- No error handling for script load failure

**Required changes:**
- Add `onerror` handler to the script element that sets a module-level
  flag `recaptchaLoadFailed = true`
- Add a global `window.addEventListener('error', ...)` handler scoped
  to reCAPTCHA errors (check `event.filename` contains `recaptcha`) that
  calls `event.preventDefault()` to suppress the uncaught error
- If the site key is empty or falsy, skip script loading entirely and
  set the load-failed flag immediately

**Design pattern:** Circuit Breaker — once reCAPTCHA is known to have
failed, all subsequent calls to `getRecaptchaToken()` return `''`
immediately without attempting execution.

### 9A.2 — Defensive Token Generation

**File:** `src/lib/recaptcha.ts` — `getRecaptchaToken()`

**Current behaviour:**
```typescript
export async function getRecaptchaToken(siteKey: string, action: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  const w = window as Window & { grecaptcha?: GrecaptchaInstance };
  if (!w.grecaptcha) return '';
  return new Promise<string>((resolve) => {
    w.grecaptcha!.ready(() => {
      w.grecaptcha!.execute(siteKey, { action }).then(resolve).catch(() => resolve(''));
    });
  });
}
```

**Required changes:**
- Check `recaptchaLoadFailed` flag first — return `''` immediately
  if true
- Wrap the entire `ready()` + `execute()` chain in a try/catch at the
  outermost level
- Add a timeout (5 seconds) — if `grecaptcha.ready()` never fires,
  resolve with `''` rather than hanging indefinitely
- Log failures to console.warn (not console.error) for debugging
  without alarming monitoring

### 9A.3 — Form Submission Guard

**File:** `src/components/assessment/AssessmentForm.tsx` — `handleSubmit()`

**Current behaviour:**
```typescript
const handleSubmit = async () => {
  // ...validation...
  let recaptchaToken = '';
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (siteKey) {
    recaptchaToken = await getRecaptchaToken(siteKey, 'assessment_submit');
  }
  setProcessingData({ formData: methods.getValues(), recaptchaToken });
};
```

**Required changes:**
- Wrap the `getRecaptchaToken()` call in a try/catch — if it throws
  for any reason, set `recaptchaToken = ''` and continue
- This is a belt-and-suspenders defence: the recaptcha module handles
  errors internally, but the form should never crash regardless

### 9A.4 — Server-Side Verification (No Changes Needed)

**File:** `src/app/api/assessment/submit/route.ts`

The existing server-side logic already handles empty tokens correctly:

```typescript
if (Env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
  // Only verify if both key AND token exist
}
```

**No changes required.** Document this existing behaviour as intentional
graceful degradation.

### 9A.5 — Environment Variable Validation

**File:** `src/libs/Env.ts`

**Current:** `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is validated as optional
string.

**Required change:** None — the current schema is correct. The fix is
in the client-side code, not the env validation.

**Documentation:** Add a comment in `.env` clarifying that an empty
`NEXT_PUBLIC_RECAPTCHA_SITE_KEY` disables bot protection but does not
block submissions.

### 9A.6 — Unit Tests

**New test file:** `src/lib/__tests__/recaptcha.test.ts`

**Test cases:**
1. `loadRecaptchaScript()` with empty site key — no script tag created
2. `loadRecaptchaScript()` with valid key — script tag created
3. `loadRecaptchaScript()` called twice — idempotent (one script tag)
4. `getRecaptchaToken()` when script not loaded — returns `''`
5. `getRecaptchaToken()` when `recaptchaLoadFailed` is true — returns
   `''` immediately
6. `getRecaptchaToken()` when `grecaptcha.execute` throws — returns `''`
7. `getRecaptchaToken()` timeout after 5s — returns `''`
8. `getRecaptchaToken()` happy path — returns token string

---

## Technical Architecture

### Files Modified

| File | Change |
|------|--------|
| `src/lib/recaptcha.ts` | Add circuit breaker, timeout, error suppression |
| `src/components/assessment/AssessmentForm.tsx` | Add try/catch around `getRecaptchaToken()` |
| `.env` | Add clarifying comment for empty key behaviour |

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/__tests__/recaptcha.test.ts` | Unit tests for all failure modes |

### Design Patterns

- **Circuit Breaker:** Module-level `recaptchaLoadFailed` flag prevents
  repeated attempts after a known failure
- **Graceful Degradation:** Empty token skips verification server-side;
  reCAPTCHA is defence-in-depth, not a hard gate
- **Timeout Pattern:** 5-second timeout prevents indefinite hangs if
  Google's script never initialises
- **Error Suppression:** Global error listener with `preventDefault()`
  for reCAPTCHA-origin errors prevents uncaught exceptions from breaking
  the page

### Impact on API/SDK

- **No API changes.** The `/api/assessment/submit` endpoint behaviour
  is unchanged.
- **No SDK changes.** The reCAPTCHA module's public interface
  (`loadRecaptchaScript`, `getRecaptchaToken`, `verifyRecaptchaToken`)
  remains identical.

### Risk Assessment

- **Risk:** Low — changes are purely additive error handling
- **Blast radius:** Only affects reCAPTCHA integration; form submission
  logic unchanged
- **Rollback:** Revert the single commit

---

## Acceptance Testing

1. **Empty site key:** Remove `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` from env,
   complete full assessment — should submit and redirect to results
2. **Invalid site key:** Set key to `invalid_key_12345`, complete
   assessment — should submit (with warning in console)
3. **Valid site key:** Set correct key, complete assessment — should
   submit with reCAPTCHA score recorded in DB
4. **Ad-blocker:** Enable uBlock Origin or similar, complete assessment
   — should submit even if reCAPTCHA script is blocked
5. **Network offline (after page load):** Disconnect WiFi after form
   loads, attempt submit — should show network error from
   ProcessingScreen (existing behaviour)
