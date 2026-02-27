import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { assessments, emailLogs } from '@/models/Schema';

import { sendViaMailgun } from './mailgun';
import { type AssessmentEmailData, buildAssessmentResultsEmail } from './templates/assessment-results';

// ── Readiness label map ──────────────────────────────────────────────────────
const READINESS_LABELS: Record<string, string> = {
  investment_ready: 'Investment Ready',
  nearly_there: 'Nearly There',
  early_stage: 'Early Stage',
  too_early: 'Too Early',
};

// ── Types ────────────────────────────────────────────────────────────────────
export type SendAssessmentEmailParams = {
  assessmentId: string;
  recipientEmail: string;
  contactName: string;
  contactCompany?: string;
  overallScore: number;
  readinessLevel: 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early';
  categoryScores: Array<{ name: string; score: number }>;
  topGaps: Array<{ title: string; currentState: string; recommendedActions: string[] }>;
  quickWins: string[];
  resultsUrl: string;
  bookingUrl: string;
};

// ── Main send function (fire-and-forget safe) ────────────────────────────────
export async function sendAssessmentEmailWithRetry(
  params: SendAssessmentEmailParams,
): Promise<void> {
  const {
    assessmentId,
    recipientEmail,
    contactName,
    contactCompany,
    overallScore,
    readinessLevel,
    categoryScores,
    topGaps,
    quickWins,
    resultsUrl,
    bookingUrl,
  } = params;

  try {
    const readinessLabel = READINESS_LABELS[readinessLevel] ?? readinessLevel;
    const subject = `Your Investor Readiness Score: ${overallScore}/100 — ${readinessLabel}`;

    const emailData: AssessmentEmailData = {
      contactName,
      contactCompany,
      overallScore,
      readinessLevel,
      categoryScores,
      topGaps,
      quickWins,
      resultsUrl,
      bookingUrl,
      unsubscribeUrl: `${resultsUrl}?unsubscribe=1`,
    };

    const html = buildAssessmentResultsEmail(emailData);

    // Create email_logs record with status 'pending'
    const logResult = await db
      .insert(emailLogs)
      .values({
        assessmentId,
        status: 'pending',
        subject,
        recipientEmail,
      })
      .returning({ id: emailLogs.id });

    const logId = logResult[0]?.id;
    if (logId === undefined) {
      console.error('[email/retry] Failed to create email_logs record for assessment:', assessmentId);
      return;
    }

    // Retry loop: 3 attempts, delays = [0, 5000, 30000] ms
    const delays = [0, 5000, 30000];
    let lastFailureReason = '';

    for (let attempt = 0; attempt < delays.length; attempt++) {
      const delay = delays[attempt] ?? 0;

      // Skip delay on first attempt
      if (attempt > 0) {
        await new Promise<void>(r => setTimeout(r, delay));
      }

      const result = await sendViaMailgun({ to: recipientEmail, subject, html });

      if (result.success) {
        // Update email_log: sent
        await db
          .update(emailLogs)
          .set({
            status: 'sent',
            messageId: result.messageId,
            sentAt: new Date(),
            retryCount: attempt,
          })
          .where(eq(emailLogs.id, logId));

        // Update assessments.emailSent = true
        await db
          .update(assessments)
          .set({ emailSent: true })
          .where(eq(assessments.id, assessmentId));

        return;
      }

      lastFailureReason = result.body;

      // Do not retry on 4xx client errors (only retry on network errors or 5xx)
      if (result.status !== 0 && result.status < 500) {
        break;
      }
    }

    // All retries failed — update email_log: failed
    await db
      .update(emailLogs)
      .set({
        status: 'failed',
        failedAt: new Date(),
        failureReason: lastFailureReason,
      })
      .where(eq(emailLogs.id, logId));
  } catch (err) {
    // Never propagate errors to callers
    console.error('[email/retry] Unexpected error for assessment:', assessmentId, err);
  }
}
