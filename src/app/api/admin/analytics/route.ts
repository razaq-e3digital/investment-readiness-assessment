import { and, gte, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/libs/DB';
import { assessments } from '@/models/Schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const range = request.nextUrl.searchParams.get('range') ?? '30';
  const days = range === 'all' ? null : range === '90' ? 90 : 30;

  const since = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : new Date('2020-01-01');

  const whereClause = and(gte(assessments.createdAt, since));

  // ── 1. Assessments over time (grouped by date) ────────────────────────────
  const byDay = await db
    .select({
      date: sql<string>`to_char(${assessments.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
      bookings: sql<number>`count(*) filter (where ${assessments.booked} = true)::int`,
    })
    .from(assessments)
    .where(whereClause)
    .groupBy(sql`to_char(${assessments.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${assessments.createdAt}, 'YYYY-MM-DD') asc`);

  // ── 2. Score distribution (10-point buckets) ──────────────────────────────
  const scoreDistribution = await db
    .select({
      bucket: sql<string>`
        case
          when ${assessments.overallScore} between 0 and 9 then '0-9'
          when ${assessments.overallScore} between 10 and 19 then '10-19'
          when ${assessments.overallScore} between 20 and 29 then '20-29'
          when ${assessments.overallScore} between 30 and 39 then '30-39'
          when ${assessments.overallScore} between 40 and 49 then '40-49'
          when ${assessments.overallScore} between 50 and 59 then '50-59'
          when ${assessments.overallScore} between 60 and 69 then '60-69'
          when ${assessments.overallScore} between 70 and 79 then '70-79'
          when ${assessments.overallScore} between 80 and 89 then '80-89'
          when ${assessments.overallScore} between 90 and 100 then '90-100'
          else 'unknown'
        end
      `,
      count: sql<number>`count(*)::int`,
    })
    .from(assessments)
    .where(and(whereClause, sql`${assessments.aiScored} = true`))
    .groupBy(sql`
        case
          when ${assessments.overallScore} between 0 and 9 then '0-9'
          when ${assessments.overallScore} between 10 and 19 then '10-19'
          when ${assessments.overallScore} between 20 and 29 then '20-29'
          when ${assessments.overallScore} between 30 and 39 then '30-39'
          when ${assessments.overallScore} between 40 and 49 then '40-49'
          when ${assessments.overallScore} between 50 and 59 then '50-59'
          when ${assessments.overallScore} between 60 and 69 then '60-69'
          when ${assessments.overallScore} between 70 and 79 then '70-79'
          when ${assessments.overallScore} between 80 and 89 then '80-89'
          when ${assessments.overallScore} between 90 and 100 then '90-100'
          else 'unknown'
        end
    `);

  // ── 3. Readiness breakdown ────────────────────────────────────────────────
  const readinessBreakdown = await db
    .select({
      level: assessments.readinessLevel,
      count: sql<number>`count(*)::int`,
    })
    .from(assessments)
    .where(and(whereClause, sql`${assessments.readinessLevel} is not null`))
    .groupBy(assessments.readinessLevel);

  // ── 4. Source breakdown ───────────────────────────────────────────────────
  const sourceBreakdown = await db
    .select({
      source: assessments.contactSource,
      count: sql<number>`count(*)::int`,
    })
    .from(assessments)
    .where(and(whereClause, sql`${assessments.contactSource} is not null`))
    .groupBy(assessments.contactSource)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  // ── 5. Key metrics ────────────────────────────────────────────────────────
  const [metrics] = await db
    .select({
      total: sql<number>`count(*)::int`,
      avgScore: sql<number | null>`round(avg(${assessments.overallScore}) filter (where ${assessments.aiScored} = true))`,
      bookingTotal: sql<number>`count(*) filter (where ${assessments.booked} = true)::int`,
    })
    .from(assessments)
    .where(whereClause);

  const totalCount = metrics?.total ?? 0;
  const bookingCount = metrics?.bookingTotal ?? 0;
  const conversionRate = totalCount > 0 ? Math.round((bookingCount / totalCount) * 1000) / 10 : 0;

  return NextResponse.json({
    assessmentsOverTime: byDay.map(r => ({
      date: r.date,
      assessments: r.count,
      bookings: r.bookings,
    })),
    scoreDistribution: [
      '0-9',
      '10-19',
      '20-29',
      '30-39',
      '40-49',
      '50-59',
      '60-69',
      '70-79',
      '80-89',
      '90-100',
    ].map(bucket => ({
      range: bucket,
      count: scoreDistribution.find(r => r.bucket === bucket)?.count ?? 0,
    })),
    readinessBreakdown: readinessBreakdown
      .filter(r => r.level !== null)
      .map(r => ({ level: r.level!, count: r.count })),
    sourceBreakdown: sourceBreakdown
      .filter(r => r.source !== null)
      .map(r => ({ source: r.source!, count: r.count })),
    metrics: {
      total: totalCount,
      avgScore: metrics?.avgScore ?? null,
      bookings: bookingCount,
      conversionRate,
    },
  });
}
