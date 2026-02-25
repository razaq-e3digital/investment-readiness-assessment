# PRD: Phase 7 — Admin Dashboard

## Overview

**Phase:** 7
**Title:** Admin Dashboard
**Goal:** Build a super admin panel to view all assessments, manage users, track bookings, handle GDPR deletions, export data, and view analytics.
**Priority:** Medium-High — essential for operations but not user-facing
**Estimated Effort:** 3–4 days
**Depends On:** Phase 4 (Results Page — assessment data must exist)
**Can Be Parallel With:** Phase 5 (Email), Phase 6 (Brevo CRM)

---

## Problem Statement

The business operator (Razaq / E3 Digital team) needs to view and manage all assessment submissions, track which founders have booked strategy calls, handle GDPR data deletion requests, export data for external analysis, and monitor key metrics. Without an admin dashboard, all of this would require direct database access.

---

## Success Criteria (Definition of Done)

- [ ] Admin route is protected (non-admins redirected)
- [ ] Dashboard overview shows 4 KPI cards with real data
- [ ] Assessments list shows all submissions with search, sort, and filter
- [ ] Individual assessment detail shows full scorecard + form responses + email/CRM status
- [ ] "Mark as Booked" action works and updates database + Brevo
- [ ] User/data deletion works (GDPR: assessment + Clerk + Brevo)
- [ ] CSV export downloads filtered assessment data
- [ ] Analytics page shows charts (assessments over time, score distribution, readiness breakdown)
- [ ] Non-admin users see a 403 or redirect

---

## Detailed Requirements

### 7.1 — Admin Route Protection

**Implementation:**
- Clerk role-based access: check for `admin` role on user metadata
- Middleware at `/dashboard/admin/*` level
- If user is not authenticated: redirect to `/sign-in`
- If user is authenticated but not admin: redirect to `/dashboard` (or show 403 page)
- Admin role set via Clerk Dashboard on specific user accounts

**MANUAL STEP:** In Clerk Dashboard, set `role: admin` in public metadata for Razaq's account and any other admin users.

**Routes to protect:**
- `/dashboard/admin` — overview
- `/dashboard/admin/assessments` — list
- `/dashboard/admin/assessments/[id]` — detail
- `/dashboard/admin/analytics` — analytics
- All `/api/admin/*` endpoints

### 7.2 — Dashboard Overview Page

**Route:** `/dashboard/admin`

**4 KPI Cards:**

1. **Total Assessments**
   - Number: count of all assessments
   - Subtitle: "+X this week" (count from last 7 days)
   - Icon: clipboard/form

2. **Average Score**
   - Number: mean of all `overall_score` values (where `ai_scored: true`)
   - Subtitle: "across X scored assessments"
   - Icon: gauge/target

3. **Bookings**
   - Number: count where `booked: true`
   - Subtitle: "X% conversion rate" (booked / total)
   - Icon: calendar/check

4. **Conversion Rate**
   - Number: percentage of assessments that resulted in a booking
   - Subtitle: "from X total assessments"
   - Icon: trending-up

**Additional section below cards:**
- "Recent Assessments" — last 5 assessments (name, score, readiness level, date)
- "Pending Review" — count of `ai_scored: false` assessments (link to filtered list)
- "Failed Email" — count of assessments with failed email delivery

### 7.3 — Assessments List Page

**Route:** `/dashboard/admin/assessments`

**Data Table (using @tanstack/react-table, already in dependencies):**

**Columns:**
- Name (contact_name)
- Email (contact_email)
- Company (contact_company)
- Score (overall_score) — colour-coded badge
- Readiness Level — colour-coded badge
- Email Status — icon (sent/delivered/opened/failed)
- CRM Status — icon (synced/not synced)
- Booked — checkbox or badge
- Date (created_at) — relative time + full date on hover
- Actions — view detail, delete

**Search:**
- Free text search across name, email, company

**Sort:**
- Click column headers to sort
- Default: newest first

**Filters:**
- Readiness level: dropdown multi-select (Investment Ready / Nearly There / Early Stage / Too Early)
- Score range: min-max slider or input
- Date range: date picker (from/to)
- Source: dropdown (LinkedIn, Google, Referral, etc.)
- Booked: Yes / No / All
- AI Scored: Yes / No / All
- Email Status: All / Sent / Delivered / Opened / Failed

**Pagination:**
- 25 rows per page (configurable: 10, 25, 50, 100)
- Page number navigation
- Total count display

**API:** `GET /api/admin/assessments` with query params for search, sort, filter, pagination

### 7.4 — Individual Assessment Detail View

**Route:** `/dashboard/admin/assessments/[id]`

**Sections:**

1. **Header**
   - Contact name, email, company, LinkedIn link
   - Source badge
   - Date submitted
   - Action buttons: "Mark as Booked" | "Delete" | "Back to List"

2. **Scorecard (reuse Phase 4 components)**
   - Overall score gauge
   - Readiness level badge
   - Category breakdown bars

3. **AI Analysis**
   - Top 3 gaps with recommendations
   - Quick wins
   - Medium-term recommendations

4. **Raw Form Responses**
   - Expandable section showing all 40+ responses
   - Question label + response value
   - Organised by section

5. **Status Panel (sidebar or section)**
   - AI Scored: Yes/No (with model name and processing time)
   - Email Status: timeline of events (sent → delivered → opened → clicked)
   - Brevo CRM: synced / not synced
   - Booked: Yes/No (with date if booked)
   - reCAPTCHA Score: value
   - Account Created: Yes/No (with Clerk user ID if applicable)

### 7.5 — "Mark as Booked" Action

**Trigger:** Button on assessment detail page + inline action on list page

**Behaviour:**
- `PATCH /api/admin/assessments/[id]/book`
- Set `booked: true` and `booked_at: now()` on assessment record
- If Brevo is configured: update contact attribute `BOOKED_CALL: true`
- Show success toast notification
- Toggle button to "Unmark" (allow reversing)

### 7.6 — User/Data Deletion (GDPR)

**Trigger:** Delete button on assessment detail page (with confirmation dialog)

**Confirmation dialog:**
- "Are you sure you want to delete this assessment and all associated data?"
- "This action cannot be undone."
- "This will delete: assessment data, email logs, analytics events, and associated Brevo contact"
- Require typing "DELETE" to confirm (prevent accidental deletion)

**Deletion steps (API: `DELETE /api/admin/assessments/[id]`):**
1. Delete all `email_logs` for this assessment
2. Delete all `analytics_events` for this assessment
3. Delete the `assessments` record
4. If `clerk_user_id` exists: delete Clerk user account via Clerk Backend API
5. If contact email exists in Brevo: delete Brevo contact via API
6. Log deletion event to Sentry (audit trail)
7. Return success

**Cascade protection:** Use database cascading where possible (ON DELETE CASCADE on email_logs and analytics_events FK)

### 7.7 — CSV Export

**Trigger:** "Export CSV" button on assessments list page

**Behaviour:**
- Export currently filtered/searched results (not just current page)
- Maximum 10,000 rows per export

**CSV columns:**
- Name, Email, Company, LinkedIn, Source
- Overall Score, Readiness Level
- Category 1-10 Scores (individual columns)
- Top Gap 1, Top Gap 2, Top Gap 3
- Email Status, Brevo Synced, Booked
- Date Submitted

**Implementation:**
- `GET /api/admin/assessments/export?[same filters as list]`
- Return CSV as file download (Content-Type: text/csv, Content-Disposition: attachment)
- Filename: `assessments-export-YYYY-MM-DD.csv`

### 7.8 — Analytics Page

**Route:** `/dashboard/admin/analytics`

**Charts:**

1. **Assessments Over Time** (Line Chart)
   - X-axis: dates (last 30 days, 90 days, or all time — toggle)
   - Y-axis: assessment count
   - Data points: daily assessment count
   - Optional: overlay booking count line

2. **Score Distribution** (Bar Chart / Histogram)
   - X-axis: score ranges (0-10, 11-20, ..., 91-100)
   - Y-axis: count of assessments in each range
   - Colour-coded by readiness level

3. **Readiness Level Breakdown** (Pie/Donut Chart)
   - Segments: Investment Ready, Nearly There, Early Stage, Too Early
   - Show count and percentage per segment
   - Colour-coded by readiness level colours

4. **Source Breakdown** (Horizontal Bar Chart)
   - Y-axis: source (LinkedIn, Google, Referral, etc.)
   - X-axis: count of assessments from each source

5. **Key Metrics Summary**
   - Average assessment completion time (if tracked)
   - Average score by source
   - Booking conversion rate trend

**Chart library:** Use a lightweight library. Options:
- Recharts (React-native, good DX)
- Chart.js with react-chartjs-2
- Keep it simple — no heavy D3 dependency

**API:** `GET /api/admin/analytics` — returns pre-computed chart data

---

## Technical Architecture

- **Routes:**
  - `src/app/dashboard/admin/page.tsx` — overview
  - `src/app/dashboard/admin/assessments/page.tsx` — list
  - `src/app/dashboard/admin/assessments/[id]/page.tsx` — detail
  - `src/app/dashboard/admin/analytics/page.tsx` — analytics
  - `src/app/dashboard/admin/layout.tsx` — admin layout with sidebar nav
- **API Routes:**
  - `src/app/api/admin/assessments/route.ts` — list (GET)
  - `src/app/api/admin/assessments/[id]/route.ts` — detail (GET), delete (DELETE)
  - `src/app/api/admin/assessments/[id]/book/route.ts` — mark as booked (PATCH)
  - `src/app/api/admin/assessments/export/route.ts` — CSV export (GET)
  - `src/app/api/admin/analytics/route.ts` — analytics data (GET)
- **Middleware:** `src/middleware.ts` — admin role check for `/dashboard/admin/*`
- **Components:**
  - `src/components/admin/KPICard.tsx`
  - `src/components/admin/AssessmentTable.tsx`
  - `src/components/admin/AssessmentDetail.tsx`
  - `src/components/admin/DeleteConfirmDialog.tsx`
  - `src/components/admin/AnalyticsCharts.tsx`
  - `src/components/admin/AdminSidebar.tsx`

---

## Dependencies

- **Upstream:** Phase 0 (auth, database), Phase 3 (assessment data), Phase 4 (score display components)
- **Downstream:** Phase 8 (testing and polish)

---

## Out of Scope

- Real-time updates (polling/websocket for new assessments)
- Admin user management (adding/removing other admins)
- Zoho booking webhook integration (manual tracking for now)
- Email template editing from admin
- Assessment re-scoring from admin
- Multi-tenant admin (single admin view for all data)
