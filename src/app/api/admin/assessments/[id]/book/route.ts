import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { assessments } from '@/models/Schema';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

const BodySchema = z.object({
  booked: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
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

  // Parse body
  let booked: boolean;
  try {
    const raw = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    booked = parsed.data.booked;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Fetch assessment to get email (for Brevo update)
  const result = await db
    .select({ contactEmail: assessments.contactEmail, brevoSynced: assessments.brevoSynced })
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);

  const assessment = result[0];
  if (!assessment) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Update database
  await db
    .update(assessments)
    .set({
      booked,
      bookedAt: booked ? new Date() : null,
    })
    .where(eq(assessments.id, id));

  // Update Brevo contact attribute (fire-and-forget)
  if (assessment.brevoSynced && Env.BREVO_API_KEY && assessment.contactEmail) {
    void fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(assessment.contactEmail)}`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': Env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          attributes: { BOOKED_CALL: booked },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    ).catch(() => {
      // Non-fatal — main DB update already succeeded
    });
  }

  return NextResponse.json({ success: true, booked });
}
