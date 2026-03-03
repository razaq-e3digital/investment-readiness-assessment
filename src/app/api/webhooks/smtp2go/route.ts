import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { assessments, emailLogs } from '@/models/Schema';

export const dynamic = 'force-dynamic';

// ── Webhook payload type ──────────────────────────────────────────────────────
type Smtp2goWebhookPayload = {
  event: string;
  email_id: string;
  rcpt: string;
  sender: string;
  subject: string;
  time: string;
  ip_address?: string;
  bounce?: string;
  webhook_id?: string;
};

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request): Promise<NextResponse> {
  // ── Bearer token verification ───────────────────────────────────────────────
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedToken = Env.SMTP2GO_WEBHOOK_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse JSON body ─────────────────────────────────────────────────────────
  let payload: Smtp2goWebhookPayload;
  try {
    payload = await request.json() as Smtp2goWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, email_id: emailId, time } = payload;
  const eventTime = new Date(time);

  // ── Look up email_logs record by email_id (= messageId) ────────────────────
  const logs = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.messageId, emailId))
    .limit(1);

  const log = logs[0];
  if (!log) {
    // Idempotent — unknown email IDs are not an error
    return NextResponse.json({ ok: true });
  }

  // ── Handle each event type ──────────────────────────────────────────────────
  // SMTP2Go uses 'open'/'click' (singular), not 'opened'/'clicked'
  if (event === 'delivered') {
    await db
      .update(emailLogs)
      .set({ status: 'delivered', deliveredAt: eventTime })
      .where(eq(emailLogs.id, log.id));

    // Mirror emailSent flag on assessment
    await db
      .update(assessments)
      .set({ emailSent: true })
      .where(eq(assessments.id, log.assessmentId));
  } else if (event === 'open') {
    await db
      .update(emailLogs)
      .set({ status: 'opened', openedAt: eventTime })
      .where(eq(emailLogs.id, log.id));
  } else if (event === 'click') {
    await db
      .update(emailLogs)
      .set({ status: 'clicked', clickedAt: eventTime })
      .where(eq(emailLogs.id, log.id));
  } else if (event === 'bounce' || event === 'reject') {
    await db
      .update(emailLogs)
      .set({ status: 'failed', failedAt: eventTime, failureReason: event === 'bounce' ? 'Bounce' : 'Rejected' })
      .where(eq(emailLogs.id, log.id));
  } else if (event === 'spam') {
    await db
      .update(emailLogs)
      .set({ status: 'bounced', failedAt: eventTime, failureReason: 'Spam complaint' })
      .where(eq(emailLogs.id, log.id));
  }

  return NextResponse.json({ ok: true });
}
