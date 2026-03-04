import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';

import type { AssessmentResponses } from '@/lib/validation/submission-schema';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { assessments } from '@/models/Schema';

// ── Types ────────────────────────────────────────────────────────────────────

export type SyncToBrevoParams = {
  assessmentId: string;
  responses: AssessmentResponses;
  overallScore: number;
  readinessLevel: 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early';
  topGaps: Array<{ title: string }>;
  resultsUrl: string;
  assessmentDate: string; // ISO date string (e.g. new Date().toISOString())
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? fullName.trim();
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  return { firstName, lastName };
}

function parseTeamSize(raw: string): number {
  // Handles both plain numbers ("5") and ranges ("1-3") — takes the first number
  const num = Number.parseInt(raw, 10);
  return Number.isNaN(num) ? 0 : num;
}

function getReadinessListId(
  level: 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early',
): number | null {
  switch (level) {
    case 'investment_ready':
      return Env.BREVO_INVESTMENT_READY_LIST_ID ?? null;
    case 'nearly_there':
      return Env.BREVO_NEARLY_THERE_LIST_ID ?? null;
    case 'early_stage':
      return Env.BREVO_EARLY_STAGE_LIST_ID ?? null;
    case 'too_early':
      return Env.BREVO_TOO_EARLY_LIST_ID ?? null;
  }
}

// ── Brevo API call ───────────────────────────────────────────────────────────

type BrevoResult = { status: number; ok: boolean };

async function callBrevoUpsert(params: SyncToBrevoParams): Promise<BrevoResult> {
  const { responses, overallScore, readinessLevel, topGaps, resultsUrl, assessmentDate } = params;
  const { firstName, lastName } = parseFullName(responses.contactName);

  const listIds: number[] = [];
  if (Env.BREVO_ASSESSMENT_LIST_ID) {
    listIds.push(Env.BREVO_ASSESSMENT_LIST_ID);
  }
  const readinessListId = getReadinessListId(readinessLevel);
  if (readinessListId !== null) {
    listIds.push(readinessListId);
  }

  const payload = {
    email: responses.contactEmail,
    attributes: {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      COMPANY: responses.contactCompany ?? '',
      LINKEDIN_URL: responses.contactLinkedin ?? '',
      ASSESSMENT_SCORE: overallScore,
      READINESS_LEVEL: readinessLevel,
      ASSESSMENT_DATE: assessmentDate,
      ASSESSMENT_URL: resultsUrl,
      SOURCE: responses.contactSource ?? '',
      TOP_GAP_1_2_3: [topGaps[0]?.title, topGaps[1]?.title, topGaps[2]?.title]
        .filter(Boolean)
        .join(' | '),
      HAS_PAYING_CUSTOMERS: responses.hasPayingCustomers === 'yes',
      FUNDING_STAGE: responses.investmentStage ?? '',
      TEAM_SIZE: parseTeamSize(responses.fullTimeTeamSize),
      BOOKED_CALL: false,
    },
    listIds,
    // Update existing contact if email already exists in Brevo
    updateEnabled: true,
  };

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': Env.BREVO_API_KEY!,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  return { status: response.status, ok: response.ok };
}

// ── Main export (fire-and-forget safe) ───────────────────────────────────────

export async function syncToBrevo(params: SyncToBrevoParams): Promise<void> {
  const { assessmentId } = params;

  if (!Env.BREVO_API_KEY) {
    // Not configured — skip silently
    return;
  }

  try {
    const result = await callBrevoUpsert(params);

    if (result.ok) {
      await db.update(assessments).set({ brevoSynced: true }).where(eq(assessments.id, assessmentId));
      return;
    }

    // 401 — bad API key; alert Sentry, do not retry
    if (result.status === 401) {
      Sentry.captureException(
        new Error('Brevo API 401 — check BREVO_API_KEY'),
        { extra: { assessmentId } },
      );
      return;
    }

    // Other 4xx — data issue; log and do not retry
    if (result.status >= 400 && result.status < 500) {
      Sentry.captureException(
        new Error(`Brevo API ${result.status} — contact sync data issue`),
        { extra: { assessmentId, status: result.status } },
      );
      return;
    }

    // 5xx or unknown — retry once after 10 seconds
    await new Promise<void>(r => setTimeout(r, 10_000));
    const retry = await callBrevoUpsert(params);

    if (retry.ok) {
      await db.update(assessments).set({ brevoSynced: true }).where(eq(assessments.id, assessmentId));
      return;
    }

    // Final failure — log to Sentry; brevoSynced remains false
    Sentry.captureException(
      new Error(`Brevo sync failed after retry — status ${retry.status}`),
      { extra: { assessmentId, status: retry.status } },
    );
  } catch (err) {
    // Network / timeout error — never propagate
    Sentry.captureException(err, { extra: { assessmentId } });
    console.error('[crm/brevo] Sync error for assessment:', assessmentId, err);
  }
}
