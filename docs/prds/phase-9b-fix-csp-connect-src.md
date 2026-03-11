# PRD: Phase 9B — Fix CSP connect-src Invalid Sources

## Overview

**Phase:** 9B
**Title:** Fix Content Security Policy connect-src Invalid Source Patterns
**Goal:** Correct invalid CSP wildcard patterns that block Sentry error
reporting and generate console warnings.
**Priority:** High — Sentry error reporting is silently broken, making
production debugging blind
**Estimated Effort:** 0.25 days
**Depends On:** Phase 0 (Boilerplate Setup)

---

## Problem Statement

The browser console shows 15+ CSP warnings on every page load:

```
The source list for the Content Security Policy directive 'connect-src'
contains an invalid source: 'https://o*.ingest.sentry.io'. It will be ignored.
```

**Root cause:** The CSP `connect-src` directive in `next.config.mjs:32`
contains `https://o*.ingest.sentry.io`. CSP wildcards (`*`) are only
valid as:
- A standalone `*` (allow everything)
- A subdomain prefix: `*.example.com` (matches `foo.example.com`)

The pattern `o*.ingest.sentry.io` places `*` mid-hostname, which is
**invalid CSP syntax**. Browsers ignore the entire source entry and log
a warning.

**Secondary issue:** The Sentry DSN in `.env` uses the EU data centre:
```
https://...@o4510799101034496.ingest.de.sentry.io/...
```
Note the `.de.` subdomain — the CSP references `ingest.sentry.io` but
the actual endpoint is `ingest.de.sentry.io`. Even with a corrected
wildcard, the domain wouldn't match.

**Impact:**
- Direct Sentry error reporting from the browser is blocked by CSP
- The Sentry tunnel (`/monitoring` rewrite) works around this for most
  errors since it uses `'self'`, but any direct XHR/fetch to Sentry
  (e.g., Session Replay attachments, large payloads) is blocked
- 15+ console warnings on every page load create noise and mask real
  errors
- Client-side errors (like the reCAPTCHA crash) may not reach Sentry

---

## Success Criteria (Definition of Done)

- [ ] No CSP "invalid source" warnings in browser console
- [ ] Sentry error reporting works both via tunnel and direct connection
- [ ] `connect-src` uses the correct EU Sentry ingest domain
- [ ] All existing security headers remain intact
- [ ] CSP does not become overly permissive (principle of least
      privilege)
- [ ] Build passes with no regressions

---

## Detailed Requirements

### 9B.1 — Fix Sentry CSP connect-src Pattern

**File:** `next.config.mjs` (line 32)

**Current:**
```javascript
`connect-src 'self' https://*.sentry.io https://o*.ingest.sentry.io https://www.google-analytics.com https://analytics.google.com https://*.clerk.accounts.dev https://clerk.e3digital.net https://openrouter.ai`
```

**Required change:**
Replace the two Sentry entries with correct, specific domains:

```javascript
`connect-src 'self' https://*.ingest.de.sentry.io https://www.google-analytics.com https://analytics.google.com https://*.clerk.accounts.dev https://clerk.e3digital.net https://openrouter.ai`
```

**Rationale:**
- `https://*.ingest.de.sentry.io` — Valid wildcard prefix matching
  `o4510799101034496.ingest.de.sentry.io` (and any other org ID)
- Removed `https://*.sentry.io` — The tunnel route (`/monitoring`)
  handles most traffic; only the ingest endpoint needs explicit CSP
  allowance
- The `.de.` subdomain matches the actual EU Sentry endpoint from the
  DSN

**Alternative (more restrictive):**
```javascript
`connect-src 'self' https://o4510799101034496.ingest.de.sentry.io https://www.google-analytics.com ...`
```
This pins to the exact org ID. More restrictive but would break if the
Sentry project is ever moved to a different org. The wildcard approach
is the Sentry-recommended pattern.

### 9B.2 — Verify Other CSP Directives

**Audit checklist (no changes expected):**

| Directive | Current Value | Status |
|-----------|--------------|--------|
| `default-src` | `'self'` | Correct |
| `script-src` | `'self' 'unsafe-inline' ...` | Correct |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Correct |
| `font-src` | `'self' https://fonts.gstatic.com` | Correct (see 9B.3) |
| `img-src` | `'self' data: ...` | Correct |
| `frame-src` | `https://accounts.google.com ...` | Correct |
| `worker-src` | `'self' blob:` | Correct |
| `object-src` | `'none'` | Correct |

### 9B.3 — Font CSP Investigation (No Fix Required)

**Console errors:**
```
Loading the font 'https://r2cdn.perplexity.ai/fonts/FKGroteskNeue.woff2'
violates the following Content Security Policy directive: "font-src 'self'
https://fonts.gstatic.com". The action has been blocked.

Loading the font 'data:font/ttf;base64,...' violates ...
```

**Analysis:** These fonts are injected by the **Perplexity AI browser
extension**, not by the application. The `FKGroteskNeue` font from
`r2cdn.perplexity.ai` and the `data:font/ttf` base64 fonts are
extension artifacts.

**Decision:** No change to `font-src`. The CSP is correctly blocking
third-party font injection. Adding `data:` to `font-src` would weaken
the security posture without benefiting the application.

**Documentation:** Add an inline comment in `next.config.mjs` noting
that browser extensions may trigger font-src CSP violations in user
consoles — this is expected and intentional.

---

## Technical Architecture

### Files Modified

| File | Change |
|------|--------|
| `next.config.mjs` | Fix `connect-src` Sentry wildcard pattern |

### No Files Created

This is a single-line configuration fix.

### Impact on API/SDK

- **No API changes.** CSP headers are response-only metadata.
- **No SDK changes.**
- **No behavioural changes** for end users except: Sentry error
  reporting becomes more reliable, console warnings disappear.

### Risk Assessment

- **Risk:** Very low — CSP header change only affects browser security
  enforcement
- **Blast radius:** All pages (CSP applies to `/(.*)`), but the change
  is strictly corrective (fixing an invalid pattern)
- **Rollback:** Revert the single commit

---

## Acceptance Testing

1. **Console clean:** Load `assess.e3digital.net` — no CSP "invalid
   source" warnings
2. **Sentry reporting:** Trigger a test error (`throw new Error('CSP
   test')` in browser console) — verify event appears in Sentry
   dashboard within 30 seconds
3. **Sentry tunnel still works:** Verify `/monitoring` endpoint
   continues to proxy error reports (check Network tab for
   `/monitoring` requests)
4. **No regressions:** Google Analytics, reCAPTCHA, Clerk auth, and
   OpenRouter AI calls all function without CSP blocks
