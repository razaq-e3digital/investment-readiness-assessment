import { clerkClient } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { analyticsEvents, assessments, emailLogs } from '@/models/Schema';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

// ── GET /api/admin/assessments/[id] ──────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const result = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);

  const assessment = result[0];
  if (!assessment) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const emailLogsResult = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.assessmentId, id))
    .limit(50);

  const rawCategoryScores = assessment.categoryScores as Record<string, number> | null;
  const categoryScores = rawCategoryScores
    ? Object.entries(rawCategoryScores).map(([name, score]) => ({ name, score }))
    : [];

  return NextResponse.json({
    id: assessment.id,
    contactName: assessment.contactName,
    contactEmail: assessment.contactEmail,
    contactCompany: assessment.contactCompany ?? null,
    contactLinkedin: assessment.contactLinkedin ?? null,
    contactSource: assessment.contactSource ?? null,
    responses: assessment.responses,
    overallScore: assessment.overallScore ?? null,
    readinessLevel: assessment.readinessLevel ?? null,
    categoryScores,
    topGaps: assessment.topGaps ?? [],
    quickWins: assessment.quickWins ?? [],
    mediumTermRecommendations: assessment.recommendations ?? [],
    aiScored: assessment.aiScored ?? false,
    aiModel: assessment.aiModel ?? null,
    aiProcessingTimeMs: assessment.aiProcessingTimeMs ?? null,
    emailSent: assessment.emailSent ?? false,
    brevoSynced: assessment.brevoSynced ?? false,
    booked: assessment.booked ?? false,
    bookedAt: assessment.bookedAt?.toISOString() ?? null,
    clerkUserId: assessment.clerkUserId ?? null,
    recaptchaScore: assessment.recaptchaScore ?? null,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt?.toISOString() ?? null,
    emailLogs: emailLogsResult.map(log => ({
      id: log.id,
      status: log.status,
      sentAt: log.sentAt?.toISOString() ?? null,
      deliveredAt: log.deliveredAt?.toISOString() ?? null,
      openedAt: log.openedAt?.toISOString() ?? null,
      clickedAt: log.clickedAt?.toISOString() ?? null,
      failedAt: log.failedAt?.toISOString() ?? null,
      failureReason: log.failureReason ?? null,
      retryCount: log.retryCount ?? 0,
    })),
  });
}

// ── DELETE /api/admin/assessments/[id] ───────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Fetch assessment first (need email + clerkUserId for external deletes)
  const result = await db
    .select({
      contactEmail: assessments.contactEmail,
      clerkUserId: assessments.clerkUserId,
      brevoSynced: assessments.brevoSynced,
    })
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);

  const assessment = result[0];
  if (!assessment) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // ── 1. Delete cascading DB records (email_logs has ON DELETE CASCADE) ────
  await db.delete(analyticsEvents).where(eq(analyticsEvents.assessmentId, id));
  await db.delete(assessments).where(eq(assessments.id, id));

  // ── 2. Delete Clerk user (if linked) ────────────────────────────────────
  if (assessment.clerkUserId) {
    try {
      const client = await clerkClient();
      await client.users.deleteUser(assessment.clerkUserId);
    } catch (err) {
      // Non-fatal — Clerk user may already be deleted
      Sentry.captureException(err, {
        extra: { assessmentId: id, clerkUserId: assessment.clerkUserId, context: 'gdpr_clerk_delete' },
      });
    }
  }

  // ── 3. Delete Brevo contact (if synced) ──────────────────────────────────
  if (assessment.brevoSynced && Env.BREVO_API_KEY && assessment.contactEmail) {
    try {
      await fetch(
        `https://api.brevo.com/v3/contacts/${encodeURIComponent(assessment.contactEmail)}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'api-key': Env.BREVO_API_KEY,
          },
          signal: AbortSignal.timeout(10_000),
        },
      );
    } catch (err) {
      // Non-fatal — log and continue
      Sentry.captureException(err, {
        extra: { assessmentId: id, context: 'gdpr_brevo_delete' },
      });
    }
  }

  // ── 4. Audit log to Sentry ────────────────────────────────────────────────
  Sentry.captureMessage('GDPR: assessment deleted', {
    level: 'info',
    extra: {
      assessmentId: id,
      hadClerkUser: Boolean(assessment.clerkUserId),
      brevoSynced: assessment.brevoSynced,
    },
  });

  return NextResponse.json({ success: true });
}
