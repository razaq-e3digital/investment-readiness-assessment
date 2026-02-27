import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { scoreAssessment } from '@/lib/ai/scoring';
import { hashIp } from '@/lib/hash';
import { checkRateLimit } from '@/lib/middleware/rate-limit';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import { SubmissionBodySchema } from '@/lib/validation/submission-schema';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { assessments } from '@/models/Schema';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ── 1. Extract and hash the client IP ──────────────────────────────────
    const forwarded = request.headers.get('x-forwarded-for');
    const rawIp = forwarded
      ? (forwarded.split(',')[0]?.trim() ?? '127.0.0.1')
      : (request.headers.get('x-real-ip') ?? '127.0.0.1');
    const ipHash = hashIp(rawIp);

    // ── 2. Rate limiting ────────────────────────────────────────────────────
    const rateLimit = await checkRateLimit(ipHash, 'assessment_submit');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'rate_limited',
          message: 'Too many submissions. Please try again later.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter) },
        },
      );
    }

    // ── 3. Parse request body ───────────────────────────────────────────────
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'invalid_json', message: 'Request body must be valid JSON.' },
        { status: 400 },
      );
    }

    // ── 4. Validate with Zod ────────────────────────────────────────────────
    const parsed = SubmissionBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      }
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const { responses, recaptchaToken } = parsed.data;

    // ── 5. Verify reCAPTCHA ─────────────────────────────────────────────────
    // Skip verification when secret key is not configured (e.g. local dev)
    let recaptchaScore: number | null = null;
    if (Env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      const captcha = await verifyRecaptchaToken(recaptchaToken, Env.RECAPTCHA_SECRET_KEY);
      if (!captcha.success) {
        return NextResponse.json(
          { success: false, error: 'captcha_failed', message: 'Bot check failed. Please try again.' },
          { status: 403 },
        );
      }
      recaptchaScore = captcha.score;
      // Scores below 0.5 are likely bots — still score with AI but note the low score
    }

    // ── 6. Save assessment to DB (ai_scored: false initially) ───────────────
    const insertResult = await db
      .insert(assessments)
      .values({
        contactName: responses.contactName,
        contactEmail: responses.contactEmail,
        contactCompany: responses.contactCompany ?? null,
        contactLinkedin: responses.contactLinkedin ?? null,
        contactSource: responses.contactSource ?? null,
        responses: responses as unknown as Record<string, unknown>,
        aiScored: false,
        ipHash,
        recaptchaScore: recaptchaScore ?? undefined,
      })
      .returning({ id: assessments.id });

    const savedId = insertResult[0]?.id;
    if (!savedId) {
      return NextResponse.json(
        { success: false, error: 'database_error', message: 'Failed to save assessment.' },
        { status: 500 },
      );
    }

    // ── 7. AI Scoring ────────────────────────────────────────────────────────
    const scoringStart = Date.now();
    let aiPending = false;

    try {
      const aiResult = await scoreAssessment(responses);
      const processingTimeMs = Date.now() - scoringStart;

      // Build categoryScores map: { "Problem-Market Fit": 72, ... }
      const categoryScores: Record<string, number> = {};
      for (const cat of aiResult.categories) {
        categoryScores[cat.name] = cat.score;
      }

      await db
        .update(assessments)
        .set({
          overallScore: aiResult.overallScore,
          readinessLevel: aiResult.readinessLevel,
          categoryScores: categoryScores as unknown as Record<string, unknown>,
          topGaps: aiResult.topGaps as unknown as Record<string, unknown>[],
          recommendations: aiResult.mediumTermRecommendations as unknown as Record<string, unknown>,
          quickWins: aiResult.quickWins as unknown as Record<string, unknown>,
          aiScored: true,
          aiModel: process.env.AI_MODEL ?? 'anthropic/claude-sonnet-4',
          aiProcessingTimeMs: processingTimeMs,
        })
        .where(eq(assessments.id, savedId));
    } catch (scoringError) {
      // AI failed — flag for manual review, but still redirect user to results
      aiPending = true;
      console.error('[assessment/submit] AI scoring failed:', scoringError);
    }

    // ── 8. Return success ───────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      assessmentId: savedId,
      redirectUrl: `/results/${savedId}`,
      ...(aiPending ? { aiPending: true } : {}),
    });
  } catch (error) {
    console.error('[assessment/submit] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
