# PRD: Phase 6 — Brevo CRM Sync

## Overview

**Phase:** 6
**Title:** Brevo CRM Sync
**Goal:** Automatically sync founder contact data and assessment results to Brevo (formerly Sendinblue) for CRM management and follow-up email sequences.
**Priority:** Medium — enhances lead management but not critical path
**Estimated Effort:** 0.5–1 day
**Depends On:** Phase 4 (Results Page — assessment data must exist)
**Can Be Parallel With:** Phase 5 (Email), Phase 7 (Admin Dashboard)

---

## Problem Statement

Assessment completions generate qualified leads. These leads need to be captured in Brevo CRM for segmented follow-up sequences, manual outreach tracking, and marketing automation. The sync must be reliable but non-blocking — a CRM sync failure should never impact the user's assessment experience.

---

## Success Criteria (Definition of Done)

- [ ] Assessment completion creates/updates a Brevo contact
- [ ] Contact attributes include all assessment data (score, readiness level, company, source)
- [ ] Contacts are segmented by readiness level in Brevo
- [ ] Sync is async and non-blocking (never delays user flow)
- [ ] Sync failures are logged but don't affect user experience
- [ ] `brevo_synced` status is tracked on the assessment record
- [ ] Retry logic: one retry on failure

---

## Detailed Requirements

### 6.1 — Brevo API Integration

**API:** Brevo REST API v3 (`https://api.brevo.com/v3/`)

**Create/Update Contact:**
- Endpoint: `POST /contacts` (create) or `PUT /contacts` (update by email)
- If contact exists (same email): update attributes with latest assessment
- If new contact: create with all attributes

**Contact attributes to sync:**
```typescript
{
  // Standard fields
  EMAIL: string;           // Contact email
  FIRSTNAME: string;       // First name (extracted from full name)
  LASTNAME: string;        // Last name (extracted from full name)

  // Custom attributes (must be created in Brevo first)
  COMPANY: string;
  LINKEDIN_URL: string;
  ASSESSMENT_SCORE: number;         // 0-100
  READINESS_LEVEL: string;          // investment_ready | nearly_there | early_stage | too_early
  ASSESSMENT_DATE: string;          // ISO date
  ASSESSMENT_URL: string;           // /results/[id] full URL
  SOURCE: string;                   // How they heard about the tool
  TOP_GAP_1: string;                // Title of top gap
  TOP_GAP_2: string;
  TOP_GAP_3: string;
  HAS_PAYING_CUSTOMERS: boolean;
  FUNDING_STAGE: string;            // pre_seed | seed | series_a | etc.
  TEAM_SIZE: number;
  BOOKED_CALL: boolean;             // Updated when marked as booked in admin
}
```

**List assignment:**
- Add contact to a "Assessment Completions" list
- Add to readiness-level-specific list:
  - "Investment Ready" list
  - "Nearly There" list
  - "Early Stage" list
  - "Too Early" list

**Environment variables required:**
```
BREVO_API_KEY=xkeysib-...
BREVO_ASSESSMENT_LIST_ID=<list_id>
BREVO_INVESTMENT_READY_LIST_ID=<list_id>
BREVO_NEARLY_THERE_LIST_ID=<list_id>
BREVO_EARLY_STAGE_LIST_ID=<list_id>
BREVO_TOO_EARLY_LIST_ID=<list_id>
```

**MANUAL STEP:** Create Brevo account, create custom contact attributes, create lists, obtain API key.

### 6.2 — Wire Into Submission Flow

**Integration point:** Same as email (Phase 5) — after assessment save and AI scoring

**Behaviour:**
- Brevo sync is ASYNC and NON-BLOCKING
- Fire-and-forget with internal error handling
- Runs in parallel with email send (Phase 5)
- Does not wait for completion before redirecting user

**Implementation:**
```typescript
// In assessment submission handler, after saving scores:
syncToBrevo({...}).catch(error => {
  logger.error('Brevo sync failed', { assessmentId, error });
  Sentry.captureException(error);
});
```

### 6.3 — Error Handling

**Retry strategy:**
- Attempt 1: immediate
- Attempt 2: after 10 seconds (if attempt 1 failed)
- No further retries (CRM sync is not critical)

**Error types:**
- Network error: retry once
- Brevo 5xx: retry once
- Brevo 4xx: do NOT retry (log error, likely a data issue)
- Brevo 401: do NOT retry (API key issue, alert Sentry)

**On final failure:**
- Log error to Sentry with full context
- Mark `brevo_synced: false` on assessment record
- Admin dashboard (Phase 7) can show which assessments failed sync

### 6.4 — Status Tracking

**On assessment record:**
- `brevo_synced: boolean` — whether sync succeeded
- Updated to `true` on successful API response
- Remains `false` if sync failed or hasn't been attempted

**Admin visibility (Phase 7):**
- Show Brevo sync status on assessment detail view
- Filter assessments by sync status
- Manual re-sync button (Phase 7 enhancement)

---

## Technical Architecture

- **CRM Service:** `src/lib/crm/brevo.ts` (Brevo API integration)
- **Types:** `src/lib/crm/types.ts` (contact attribute types)

---

## Dependencies

- **Upstream:** Phase 3 (assessment data), Phase 4 (results URL)
- **Downstream:** Phase 7 (admin dashboard shows sync status)

---

## Out of Scope

- Brevo email automation sequences (configured directly in Brevo UI)
- Two-way sync (Brevo → app)
- Brevo webhook integration
- Contact deletion sync (handled in Phase 7 GDPR deletion)
