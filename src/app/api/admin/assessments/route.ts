import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/libs/DB';
import { assessments, emailLogs } from '@/models/Schema';

export const dynamic = 'force-dynamic';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { searchParams } = request.nextUrl;

  // ── Pagination ───────────────────────────────────────────────────────────
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const rawPageSize = Number(searchParams.get('pageSize') ?? '25');
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as typeof PAGE_SIZE_OPTIONS[number])
    ? rawPageSize
    : 25;
  const offset = (page - 1) * pageSize;

  // ── Filters ──────────────────────────────────────────────────────────────
  const search = searchParams.get('search') ?? '';
  const readinessFilter = searchParams.getAll('readiness'); // can be multiple
  const minScore = searchParams.get('minScore');
  const maxScore = searchParams.get('maxScore');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const bookedFilter = searchParams.get('booked'); // 'yes' | 'no' | ''
  const aiScoredFilter = searchParams.get('aiScored'); // 'yes' | 'no' | ''
  const sourceFilter = searchParams.get('source');

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc';

  // ── Build WHERE conditions ────────────────────────────────────────────────
  const conditions = [];

  if (search.length > 0) {
    conditions.push(
      or(
        ilike(assessments.contactName, `%${search}%`),
        ilike(assessments.contactEmail, `%${search}%`),
        ilike(assessments.contactCompany, `%${search}%`),
      ),
    );
  }

  if (readinessFilter.length > 0) {
    conditions.push(
      or(...readinessFilter.map(r => eq(assessments.readinessLevel, r))),
    );
  }

  if (minScore) {
    conditions.push(gte(assessments.overallScore, Number(minScore)));
  }

  if (maxScore) {
    conditions.push(lte(assessments.overallScore, Number(maxScore)));
  }

  if (dateFrom) {
    conditions.push(gte(assessments.createdAt, new Date(dateFrom)));
  }

  if (dateTo) {
    conditions.push(lte(assessments.createdAt, new Date(dateTo)));
  }

  if (bookedFilter === 'yes') {
    conditions.push(eq(assessments.booked, true));
  } else if (bookedFilter === 'no') {
    conditions.push(eq(assessments.booked, false));
  }

  if (aiScoredFilter === 'yes') {
    conditions.push(eq(assessments.aiScored, true));
  } else if (aiScoredFilter === 'no') {
    conditions.push(eq(assessments.aiScored, false));
  }

  if (sourceFilter) {
    conditions.push(eq(assessments.contactSource, sourceFilter));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // ── Sort column ──────────────────────────────────────────────────────────
  const sortMap: Record<string, unknown> = {
    createdAt: assessments.createdAt,
    overallScore: assessments.overallScore,
    contactName: assessments.contactName,
    readinessLevel: assessments.readinessLevel,
  };

  const sortColumn = sortMap[sortBy] ?? assessments.createdAt;
  const orderBy = sortDir === 'asc'
    ? asc(sortColumn as Parameters<typeof asc>[0])
    : desc(sortColumn as Parameters<typeof desc>[0]);

  // ── Query ────────────────────────────────────────────────────────────────
  const [rows, [countResult]] = await Promise.all([
    db
      .select({
        id: assessments.id,
        contactName: assessments.contactName,
        contactEmail: assessments.contactEmail,
        contactCompany: assessments.contactCompany,
        overallScore: assessments.overallScore,
        readinessLevel: assessments.readinessLevel,
        aiScored: assessments.aiScored,
        emailSent: assessments.emailSent,
        brevoSynced: assessments.brevoSynced,
        booked: assessments.booked,
        bookedAt: assessments.bookedAt,
        createdAt: assessments.createdAt,
      })
      .from(assessments)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(assessments)
      .where(where),
  ]);

  // Fetch latest email status for each assessment
  const ids = rows.map(r => r.id);
  const emailStatuses = ids.length > 0
    ? await db
      .select({
        assessmentId: emailLogs.assessmentId,
        status: emailLogs.status,
      })
      .from(emailLogs)
      .where(or(...ids.map(id => eq(emailLogs.assessmentId, id))))
      .orderBy(desc(emailLogs.updatedAt))
    : [];

  const emailStatusMap = new Map<string, string>();
  for (const es of emailStatuses) {
    if (!emailStatusMap.has(es.assessmentId)) {
      emailStatusMap.set(es.assessmentId, es.status);
    }
  }

  const total = countResult?.count ?? 0;

  return NextResponse.json({
    data: rows.map(r => ({
      id: r.id,
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      contactCompany: r.contactCompany ?? null,
      overallScore: r.overallScore ?? null,
      readinessLevel: r.readinessLevel ?? null,
      aiScored: r.aiScored ?? false,
      emailSent: r.emailSent ?? false,
      emailStatus: emailStatusMap.get(r.id) ?? null,
      brevoSynced: r.brevoSynced ?? false,
      booked: r.booked ?? false,
      bookedAt: r.bookedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
