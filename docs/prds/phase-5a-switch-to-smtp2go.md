# PRD: Phase 5A — Switch Email Provider to SMTP2Go

## Overview

**Phase:** 5A
**Title:** Switch Email Provider from Mailgun to SMTP2Go
**Goal:** Replace the Mailgun email integration with SMTP2Go, keeping all existing email behaviour (branded HTML scorecard, retry logic, fire-and-forget, webhook tracking).
**Priority:** High — Mailgun free plan only supports one domain and is already in use elsewhere
**Estimated Effort:** 0.5–1 day
**Depends On:** Phase 5 (Email Delivery — already implemented with Mailgun)
**Can Be Parallel With:** N/A — this is a direct replacement of Phase 5 internals

---

## Problem Statement

The Mailgun free plan restricts accounts to a single verified sending domain. The existing Mailgun account is already bound to another application's domain. Rather than upgrading to a paid Mailgun plan, we will switch to SMTP2Go which offers a free tier (1,000 emails/month) sufficient for early-stage assessment volume, supports EU data processing, and provides webhook event tracking.

All external behaviour stays the same: founders still receive a branded HTML email after completing the assessment, delivery events are still tracked, and email never blocks the results page.

---

## Success Criteria (Definition of Done)

- [ ] Mailgun code is fully removed (no dead code left behind)
- [ ] SMTP2Go send function works via the REST API (`/v3/email/send`)
- [ ] EU API endpoint is used (`https://eu-api.smtp2go.com/v3`) for GDPR compliance
- [ ] Reply-To header is sent via `custom_headers`
- [ ] Retry logic still works (3 attempts: immediate, +5 s, +30 s)
- [ ] Webhook endpoint receives and processes SMTP2Go events
- [ ] Webhook is secured (bearer token in Authorization header)
- [ ] `email_logs` table is updated correctly on send and webhook events
- [ ] `assessments.emailSent` flag is set on successful send/delivery
- [ ] HTML email template is unchanged (no template modifications needed)
- [ ] Environment variables are updated in Env.ts, .env.example, and Railway
- [ ] Build, lint, and type-check pass

---

## Detailed Requirements

### 5A.1 — Replace Mailgun Send Function with SMTP2Go

**File:** `src/lib/email/smtp2go.ts` (new file, replaces `src/lib/email/mailgun.ts`)

**SMTP2Go REST API details:**

- **Endpoint:** `POST https://eu-api.smtp2go.com/v3/email/send`
- **Auth:** `X-Smtp2go-Api-Key` header (API key)
- **Content-Type:** `application/json`
- **Request body:**

```json
{
  "sender": "E3 Digital <info@e3digital.net>",
  "to": ["recipient@example.com"],
  "subject": "Your Investor Readiness Score: 82/100 — Nearly There",
  "html_body": "<html>...</html>",
  "custom_headers": [
    { "header": "Reply-To", "value": "razaq@e3.digital" }
  ]
}
```

- **Success response (200):**

```json
{
  "request_id": "aa253464-0bd0-467a-b24b-6159dcd7be60",
  "data": {
    "succeeded": 1,
    "failed": 0,
    "failures": [],
    "email_id": "1er8bV-6Tw0Mi-7h"
  }
}
```

- **Error response (400):** `{ "error_code": "...", "error": "..." }`

**Function signature (keep the same shape as the Mailgun version):**

```typescript
type Smtp2goSendParams = {
  to: string;
  subject: string;
  html: string;
};

type Smtp2goSendResult =
  | { success: true; messageId: string }
  | { success: false; status: number; body: string };

async function sendViaSmtp2go(
  params: Smtp2goSendParams,
): Promise<Smtp2goSendResult>;
```

**Key differences from Mailgun:**
- JSON body instead of URL-encoded form data
- API key via `X-Smtp2go-Api-Key` header (not HTTP Basic Auth)
- Reply-To set via `custom_headers` array (not `h:Reply-To` form field)
- Response returns `data.email_id` (not `id`) as the message identifier
- No `recipientVariables` — SMTP2Go does not use this concept
- Sender must be a verified sender address in the SMTP2Go account

**Environment variables:**

```
SMTP2GO_API_KEY=api-...
```

Only one env var needed. The sender domain (`e3digital.net`) must be verified in the SMTP2Go dashboard, but no domain env var is required in the code — the sender address is hardcoded as `E3 Digital <info@e3digital.net>`.

**MANUAL STEP:** Create SMTP2Go account, verify sender domain (SPF + DKIM DNS records for `e3digital.net`), generate API key with email send permissions.

### 5A.2 — Update Retry Logic

**File:** `src/lib/email/retry.ts`

Minimal changes:
- Change import from `./mailgun` to `./smtp2go`
- Replace `sendViaMailgun()` call with `sendViaSmtp2go()`
- Remove `recipientVariables` from the send params (SMTP2Go doesn't use it)
- The `messageId` field maps to SMTP2Go's `data.email_id` — the result type shape is identical so the rest of the retry logic is unchanged

### 5A.3 — Replace Mailgun Webhook with SMTP2Go Webhook

**File:** `src/app/api/webhooks/smtp2go/route.ts` (new file, replaces `src/app/api/webhooks/mailgun/route.ts`)

**SMTP2Go webhook payload (JSON output):**

```json
{
  "event": "delivered",
  "email_id": "1er8bV-6Tw0Mi-7h",
  "rcpt": "founder@example.com",
  "sender": "info@e3digital.net",
  "subject": "Your Investor Readiness Score: 82/100 — Nearly There",
  "time": "2025-06-15T10:30:00Z",
  "ip_address": "1.2.3.4",
  "bounce": "hard",
  "webhook_id": "abc123"
}
```

**Event mapping (SMTP2Go → our status):**

| SMTP2Go event | `email_logs.status` | Timestamp field |
|---|---|---|
| `delivered` | `delivered` | `deliveredAt` |
| `open` | `opened` | `openedAt` |
| `click` | `clicked` | `clickedAt` |
| `bounce` | `failed` | `failedAt` |
| `spam` | `bounced` | `failedAt` |
| `reject` | `failed` | `failedAt` |

Note: SMTP2Go uses `open` / `click` (singular) not `opened` / `clicked` like Mailgun.

**Webhook security:**

SMTP2Go does not support HMAC signature verification. Secure the webhook using:
1. **Bearer token in Authorization header** — configure in SMTP2Go webhook settings. Verify the `Authorization: Bearer <token>` header in the route handler.
2. The webhook URL remains under `/api/webhooks/` which is already a public route in middleware.

**Environment variable:**

```
SMTP2GO_WEBHOOK_TOKEN=a-long-random-secret-string
```

**Verification logic:**

```typescript
const token = request.headers.get('authorization')?.replace('Bearer ', '');
if (token !== Env.SMTP2GO_WEBHOOK_TOKEN) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Email ID matching:**

The webhook payload includes `email_id` at the top level. Match this against `email_logs.messageId` (which stores the `data.email_id` from the send response).

**MANUAL STEP:** In the SMTP2Go dashboard (Settings > Webhooks), add a webhook:
- URL: `https://assess.e3digital.net/api/webhooks/smtp2go`
- Output: JSON
- Events: delivered, open, click, bounce, spam, reject
- Authorization header: `Bearer <SMTP2GO_WEBHOOK_TOKEN value>`

### 5A.4 — Update Environment Configuration

**File:** `src/libs/Env.ts`

Remove:
```typescript
MAILGUN_API_KEY: z.string().optional(),
MAILGUN_DOMAIN: z.string().optional(),
MAILGUN_WEBHOOK_SIGNING_KEY: z.string().optional(),
```

Add:
```typescript
SMTP2GO_API_KEY: z.string().optional(),
SMTP2GO_WEBHOOK_TOKEN: z.string().optional(),
```

Update `runtimeEnv` mapping accordingly.

### 5A.5 — Delete Mailgun Files

Remove these files entirely:
- `src/lib/email/mailgun.ts`
- `src/app/api/webhooks/mailgun/route.ts`

### 5A.6 — Update .env.example

Replace the `# ── Email (Mailgun)` section with:

```
# ── Email (SMTP2Go) ─────────────────────────────
SMTP2GO_API_KEY=api-...
SMTP2GO_WEBHOOK_TOKEN=your-webhook-bearer-token
```

---

## Technical Architecture

```
Assessment Submission (unchanged)
  ↓
sendAssessmentEmailWithRetry() [Fire-and-Forget]
  ├→ Create email_logs (status: pending)
  ├→ Retry loop: 0 ms, 5 s, 30 s delays
  ├→ sendViaSmtp2go()  ← NEW (was sendViaMailgun)
  │     POST https://eu-api.smtp2go.com/v3/email/send
  │     Auth: X-Smtp2go-Api-Key header
  │     Body: JSON { sender, to, subject, html_body, custom_headers }
  ├→ Update email_logs (status: sent, messageId = data.email_id)
  └→ Update assessments.emailSent = true

SMTP2Go Webhook Events  ← NEW endpoint
  ↓
POST /api/webhooks/smtp2go
  ├→ Verify Bearer token
  ├→ Look up email_logs by email_id (= messageId)
  └→ Update status (delivered | opened | clicked | failed | bounced)
```

**File changes summary:**

| Action | File |
|---|---|
| CREATE | `src/lib/email/smtp2go.ts` |
| CREATE | `src/app/api/webhooks/smtp2go/route.ts` |
| MODIFY | `src/lib/email/retry.ts` |
| MODIFY | `src/libs/Env.ts` |
| MODIFY | `.env.example` |
| DELETE | `src/lib/email/mailgun.ts` |
| DELETE | `src/app/api/webhooks/mailgun/route.ts` |

---

## Dependencies

- **Upstream:** Phase 5 (existing email implementation to be replaced)
- **Downstream:** Phase 7 (admin dashboard reads `email_logs` — no changes needed, schema is unchanged)
- **External:** SMTP2Go account with verified sender domain (`e3digital.net`)

---

## Out of Scope

- Changing the HTML email template (it stays exactly as-is)
- Changing the retry strategy or fire-and-forget pattern
- Changing the `email_logs` database schema (field names stay the same)
- SMTP-based sending (we use the REST API only)
- Email archiving or SMTP2Go-specific template features
- Webhook management via API (webhooks are configured manually in the dashboard)
