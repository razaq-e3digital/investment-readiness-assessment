import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { assessments } from '@/models/Schema';

const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  // ── 1. Require authenticated Clerk session ───────────────────────────────
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // ── 2. Fetch assessment ──────────────────────────────────────────────────
  const result = await db
    .select({ id: assessments.id, clerkUserId: assessments.clerkUserId })
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);

  const assessment = result[0];

  if (!assessment) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // ── 3. Prevent overwriting another user's claim ──────────────────────────
  if (assessment.clerkUserId && assessment.clerkUserId !== userId) {
    return NextResponse.json({ error: 'already_claimed' }, { status: 409 });
  }

  // ── 4. Link assessment to Clerk user ─────────────────────────────────────
  await db
    .update(assessments)
    .set({ clerkUserId: userId })
    .where(eq(assessments.id, id));

  return NextResponse.json({ success: true });
}
