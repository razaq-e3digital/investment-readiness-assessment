import { and, desc, eq, gte, ilike, lte, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/libs/DB';
import { assessments } from '@/models/Schema';

export const dynamic = 'force-dynamic';

const MAX_ROWS = 10_000;

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // Escape double quotes and wrap in quotes if needed
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest): Promise<Response> {
  const denied = await requireAdmin();
  if (denied) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
  }

  const { searchParams } = request.nextUrl;

  // Same filters as list endpoint
  const search = searchParams.get('search') ?? '';
  const readinessFilter = searchParams.getAll('readiness');
  const minScore = searchParams.get('minScore');
  const maxScore = searchParams.get('maxScore');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const bookedFilter = searchParams.get('booked');
  const aiScoredFilter = searchParams.get('aiScored');
  const sourceFilter = searchParams.get('source');

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
    conditions.push(or(...readinessFilter.map(r => eq(assessments.readinessLevel, r))));
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

  const rows = await db
    .select()
    .from(assessments)
    .where(where)
    .orderBy(desc(assessments.createdAt))
    .limit(MAX_ROWS);

  // ── Build CSV ─────────────────────────────────────────────────────────────
  const headers = [
    'Name',
    'Email',
    'Company',
    'LinkedIn',
    'Source',
    'Overall Score',
    'Readiness Level',
    'Top Gap 1',
    'Top Gap 2',
    'Top Gap 3',
    'Email Status',
    'Brevo Synced',
    'Booked',
    'Booked At',
    'Date Submitted',
  ];

  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const gaps = (row.topGaps ?? []) as Array<{ title?: string }>;
    const emailStatus = row.emailSent ? 'sent' : 'not sent';

    const cells = [
      escapeCsv(row.contactName),
      escapeCsv(row.contactEmail),
      escapeCsv(row.contactCompany),
      escapeCsv(row.contactLinkedin),
      escapeCsv(row.contactSource),
      escapeCsv(row.overallScore),
      escapeCsv(row.readinessLevel),
      escapeCsv(gaps[0]?.title),
      escapeCsv(gaps[1]?.title),
      escapeCsv(gaps[2]?.title),
      escapeCsv(emailStatus),
      escapeCsv(row.brevoSynced),
      escapeCsv(row.booked),
      escapeCsv(row.bookedAt?.toISOString()),
      escapeCsv(row.createdAt.toISOString()),
    ];

    csvRows.push(cells.join(','));
  }

  const csv = csvRows.join('\n');
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="assessments-export-${date}.csv"`,
    },
  });
}
