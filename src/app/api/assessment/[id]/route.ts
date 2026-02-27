import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hashIp } from '@/lib/hash';
import { checkRateLimit } from '@/lib/middleware/rate-limit';
import { db } from '@/libs/DB';
import { assessments } from '@/models/Schema';

// UUID v4 format
const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const { id } = params;

  // ── 1. Validate UUID format ──────────────────────────────────────────────
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // ── 2. Rate limiting — 30 reads per minute per IP ────────────────────────
  const forwarded = request.headers.get('x-forwarded-for');
  const rawIp = forwarded
    ? (forwarded.split(',')[0]?.trim() ?? '127.0.0.1')
    : (request.headers.get('x-real-ip') ?? '127.0.0.1');
  const ipHash = hashIp(rawIp);

  const rateLimit = await checkRateLimit(ipHash, 'assessment_read', {
    windowMs: 60_000, // 1 minute
    maxRequests: 30,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter) },
      },
    );
  }

  // ── 3. Fetch assessment ──────────────────────────────────────────────────
  const result = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);

  const assessment = result[0];

  if (!assessment) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // ── 4. Shape the response (no raw email/IP in output) ────────────────────
  const rawCategoryScores = assessment.categoryScores as Record<string, number> | null;
  const categoryScores = rawCategoryScores
    ? Object.entries(rawCategoryScores).map(([name, score]) => ({ name, score }))
    : [];

  return NextResponse.json({
    id: assessment.id,
    overallScore: assessment.overallScore,
    readinessLevel: assessment.readinessLevel,
    categoryScores,
    topGaps: assessment.topGaps ?? [],
    quickWins: assessment.quickWins ?? [],
    mediumTermRecommendations: assessment.recommendations ?? [],
    contactName: assessment.contactName,
    contactCompany: assessment.contactCompany ?? null,
    createdAt: assessment.createdAt.toISOString(),
    aiScored: assessment.aiScored ?? false,
    pending: !(assessment.aiScored ?? false),
  });
}
