import { and, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/libs/DB';
import { assessments } from '@/models/Schema';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Total assessments (all time + this week + last week)
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      thisWeek: sql<number>`count(*) filter (where ${assessments.createdAt} >= ${oneWeekAgo})::int`,
      lastWeek: sql<number>`count(*) filter (where ${assessments.createdAt} >= ${twoWeeksAgo} and ${assessments.createdAt} < ${oneWeekAgo})::int`,
    })
    .from(assessments);

  // Average score (this month vs last month)
  const [scores] = await db
    .select({
      avgScoreThisMonth: sql<number | null>`avg(${assessments.overallScore}) filter (where ${assessments.createdAt} >= ${oneMonthAgo} and ${assessments.aiScored} = true)`,
      avgScoreLastMonth: sql<number | null>`avg(${assessments.overallScore}) filter (where ${assessments.createdAt} >= ${twoMonthsAgo} and ${assessments.createdAt} < ${oneMonthAgo} and ${assessments.aiScored} = true)`,
    })
    .from(assessments);

  // Bookings
  const [bookings] = await db
    .select({
      total: sql<number>`count(*) filter (where ${assessments.booked} = true)::int`,
      thisWeek: sql<number>`count(*) filter (where ${assessments.booked} = true and ${assessments.bookedAt} >= ${oneWeekAgo})::int`,
      lastWeek: sql<number>`count(*) filter (where ${assessments.booked} = true and ${assessments.bookedAt} >= ${twoWeeksAgo} and ${assessments.bookedAt} < ${oneWeekAgo})::int`,
    })
    .from(assessments);

  // Recent assessments (last 5)
  const recent = await db
    .select({
      id: assessments.id,
      contactName: assessments.contactName,
      contactCompany: assessments.contactCompany,
      contactEmail: assessments.contactEmail,
      overallScore: assessments.overallScore,
      readinessLevel: assessments.readinessLevel,
      booked: assessments.booked,
      aiScored: assessments.aiScored,
      emailSent: assessments.emailSent,
      createdAt: assessments.createdAt,
    })
    .from(assessments)
    .orderBy(sql`${assessments.createdAt} desc`)
    .limit(5);

  // Compute percentage changes
  function pctChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  const totalCount = totals?.total ?? 0;
  const thisWeekCount = totals?.thisWeek ?? 0;
  const lastWeekCount = totals?.lastWeek ?? 0;
  const weekChange = pctChange(thisWeekCount, lastWeekCount);

  const avgScoreNow = Math.round(scores?.avgScoreThisMonth ?? 0);
  const avgScorePrev = Math.round(scores?.avgScoreLastMonth ?? 0);
  const scoreChange = pctChange(avgScoreNow, avgScorePrev);

  const bookingTotal = bookings?.total ?? 0;
  const bookingThisWeek = bookings?.thisWeek ?? 0;
  const bookingLastWeek = bookings?.lastWeek ?? 0;
  const bookingChange = pctChange(bookingThisWeek, bookingLastWeek);

  // Conversion rate = bookings / total assessments
  const conversionRate = totalCount > 0 ? Math.round((bookingTotal / totalCount) * 1000) / 10 : 0;
  // Previous week conversion rate (approx)
  const prevTotal = lastWeekCount + (totalCount - thisWeekCount);
  const prevConversionRate = prevTotal > 0 ? Math.round((bookingLastWeek / prevTotal) * 1000) / 10 : 0;
  const conversionChange = pctChange(conversionRate, prevConversionRate);

  // Get total count for pagination footer
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assessments)
    .where(and(gte(assessments.createdAt, oneWeekAgo)));

  return NextResponse.json({
    kpis: {
      totalAssessments: { value: totalCount, change: weekChange },
      averageScore: { value: avgScoreNow, change: scoreChange },
      bookings: { value: bookingTotal, change: bookingChange },
      conversionRate: { value: conversionRate, change: conversionChange },
    },
    recentAssessments: recent.map(a => ({
      id: a.id,
      contactName: a.contactName,
      contactCompany: a.contactCompany ?? null,
      overallScore: a.overallScore ?? null,
      readinessLevel: a.readinessLevel ?? null,
      booked: a.booked ?? false,
      aiScored: a.aiScored ?? false,
      emailSent: a.emailSent ?? false,
      createdAt: a.createdAt.toISOString(),
    })),
    totalThisWeek: countResult?.count ?? 0,
  });
}
