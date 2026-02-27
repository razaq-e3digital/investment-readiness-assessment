import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { assessments, emailLogs } from '@/models/Schema';

export const dynamic = 'force-dynamic';

// ── Webhook payload types ────────────────────────────────────────────────────
type MailgunSignature = {
  timestamp: string;
  token: string;
  signature: string;
};

type MailgunDeliveryStatus = {
  message?: string;
  description?: string;
};

type MailgunEventData = {
  'event': string;
  'message': {
    headers: {
      'message-id': string;
    };
  };
  'timestamp': number;
  'delivery-status'?: MailgunDeliveryStatus;
};

type MailgunWebhookPayload = {
  'signature': MailgunSignature;
  'event-data': MailgunEventData;
};

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request): Promise<NextResponse> {
  let payload: MailgunWebhookPayload;

  try {
    payload = await request.json() as MailgunWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { signature, 'event-data': eventData } = payload;

  // ── Signature verification ─────────────────────────────────────────────────
  const signingKey = Env.MAILGUN_WEBHOOK_SIGNING_KEY;

  if (signingKey) {
    const { timestamp, token, signature: providedSig } = signature;
    const computed = crypto
      .createHmac('sha256', signingKey)
      .update(timestamp + token)
      .digest('hex');

    let valid = false;
    try {
      valid = crypto.timingSafeEqual(
        Buffer.from(computed, 'hex'),
        Buffer.from(providedSig, 'hex'),
      );
    } catch {
      valid = false;
    }

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  // ── Extract event details ──────────────────────────────────────────────────
  const event = eventData.event;
  const rawMessageId = eventData.message.headers['message-id'] ?? '';
  // Strip angle brackets that may wrap the ID
  const messageId = rawMessageId.replace(/^<|>$/g, '');

  // ── Look up email_logs record ──────────────────────────────────────────────
  const logs = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.messageId, messageId))
    .limit(1);

  const log = logs[0];
  if (!log) {
    // Idempotent — unknown message IDs are not an error
    return NextResponse.json({ ok: true });
  }

  const eventTime = new Date(eventData.timestamp * 1000);

  // ── Handle each event type ──────────────────────────────────────────────────
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
  } else if (event === 'opened') {
    await db
      .update(emailLogs)
      .set({ status: 'opened', openedAt: eventTime })
      .where(eq(emailLogs.id, log.id));
  } else if (event === 'clicked') {
    await db
      .update(emailLogs)
      .set({ status: 'clicked', clickedAt: eventTime })
      .where(eq(emailLogs.id, log.id));
  } else if (event === 'failed') {
    const deliveryStatus = eventData['delivery-status'];
    const failureReason = deliveryStatus?.message ?? deliveryStatus?.description ?? 'Unknown failure';

    await db
      .update(emailLogs)
      .set({ status: 'failed', failedAt: eventTime, failureReason })
      .where(eq(emailLogs.id, log.id));
  } else if (event === 'complained') {
    await db
      .update(emailLogs)
      .set({ status: 'bounced', failedAt: eventTime, failureReason: 'Spam complaint' })
      .where(eq(emailLogs.id, log.id));
  }

  return NextResponse.json({ ok: true });
}
