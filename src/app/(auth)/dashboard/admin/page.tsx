import {
  BookMarked,
  ClipboardList,
  Gauge,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import KPICard from '@/components/admin/KPICard';
import type { ReadinessLevel } from '@/components/results/ReadinessLevelBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

type KPIData = {
  value: number;
  change: number;
};

type StatsResponse = {
  kpis: {
    totalAssessments: KPIData;
    averageScore: KPIData;
    bookings: KPIData;
    conversionRate: KPIData;
  };
  recentAssessments: {
    id: string;
    contactName: string;
    contactCompany: string | null;
    overallScore: number | null;
    readinessLevel: string | null;
    booked: boolean;
    aiScored: boolean;
    emailSent: boolean;
    createdAt: string;
  }[];
  totalThisWeek: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(ms / 60_000);
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(ms / 86_400_000);
  if (mins < 60) {
    return `${mins}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${days}d ago`;
}

function getScoreColor(score: number | null): string {
  if (score === null) {
    return 'bg-gray-200';
  }
  if (score >= 75) {
    return 'bg-score-green';
  }
  if (score >= 50) {
    return 'bg-score-blue';
  }
  if (score >= 25) {
    return 'bg-score-orange';
  }
  return 'bg-score-red';
}

const READINESS_BADGE: Record<string, { label: string; className: string }> = {
  investment_ready: {
    label: 'Investor Ready',
    className: 'bg-score-green-bg text-score-green',
  },
  nearly_there: {
    label: 'Nearly There',
    className: 'bg-accent-blue-light text-accent-blue',
  },
  early_stage: {
    label: 'Early Stage',
    className: 'bg-score-orange-bg text-score-orange',
  },
  too_early: {
    label: 'Too Early',
    className: 'bg-score-red-bg text-score-red',
  },
};

function ReadinessBadge({ level }: { level: string | null }) {
  if (!level) {
    return <span className="text-xs text-text-muted">Pending</span>;
  }
  const config = READINESS_BADGE[level] ?? READINESS_BADGE.early_stage!;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

// ── Data fetching (server component) ─────────────────────────────────────────

async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      cache: 'no-store',
      headers: { 'x-internal-request': '1' },
    });
    if (!res.ok) {
      return null;
    }
    return res.json() as Promise<StatsResponse>;
  } catch {
    return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminOverviewPage() {
  const data = await fetchStats();

  const kpis = data?.kpis;
  const recent = data?.recentAssessments ?? [];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Welcome back, Razaq. Here's what's happening.
        </p>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Assessments"
          value={kpis?.totalAssessments.value ?? 0}
          change={kpis?.totalAssessments.change ?? 0}
          iconBg="bg-accent-blue-light"
          icon={<ClipboardList className="size-5 text-accent-blue" />}
        />
        <KPICard
          label="Average Score"
          value={kpis?.averageScore.value ?? 0}
          change={kpis?.averageScore.change ?? 0}
          iconBg="bg-[#ede9fe]"
          icon={<Gauge className="size-5 text-[#7c3aed]" />}
        />
        <KPICard
          label="Bookings"
          value={kpis?.bookings.value ?? 0}
          change={kpis?.bookings.change ?? 0}
          iconBg="bg-[#dcfce7]"
          icon={<BookMarked className="size-5 text-score-green" />}
        />
        <KPICard
          label="Conversion Rate"
          value={`${kpis?.conversionRate.value ?? 0}%`}
          change={kpis?.conversionRate.change ?? 0}
          iconBg="bg-[#ffedd5]"
          icon={<TrendingUp className="size-5 text-score-orange" />}
        />
      </div>

      {/* Recent assessments table */}
      <div className="rounded-xl border border-card-border bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent Assessments</h2>
          <Link
            href="/dashboard/admin/assessments"
            className="text-sm font-medium text-accent-blue hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0
          ? (
              <div className="py-16 text-center text-sm text-text-muted">
                No assessments yet.
              </div>
            )
          : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-card-border bg-page-bg">
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                          Founder
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(assessment => (
                        <tr
                          key={assessment.id}
                          className="border-b border-card-border last:border-b-0 hover:bg-page-bg"
                        >
                          {/* Founder */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-blue-light text-sm font-semibold text-accent-blue">
                                {assessment.contactName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">
                                  {assessment.contactName}
                                </p>
                                <p className="text-xs text-text-muted">
                                  {assessment.contactCompany ?? '—'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-text-secondary">
                            {relativeTime(assessment.createdAt)}
                          </td>

                          {/* Score */}
                          <td className="px-6 py-4">
                            {assessment.aiScored && assessment.overallScore !== null
                              ? (
                                  <div className="flex items-center gap-2">
                                    <span className="w-8 text-right font-medium text-text-primary">
                                      {assessment.overallScore}
                                    </span>
                                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                      <div
                                        className={`h-full rounded-full ${getScoreColor(assessment.overallScore)}`}
                                        style={{ width: `${assessment.overallScore}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              : (
                                  <span className="text-xs text-text-muted">Pending</span>
                                )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <ReadinessBadge level={assessment.readinessLevel as ReadinessLevel | null} />
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/admin/assessments/${assessment.id}`}
                              className="text-sm font-medium text-accent-blue hover:underline"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="flex items-center justify-between border-t border-card-border px-6 py-3">
                  <p className="text-sm text-text-muted">
                    Showing 1 to
                    {' '}
                    {recent.length}
                    {' '}
                    of
                    {' '}
                    {data?.kpis.totalAssessments.value ?? recent.length}
                    {' '}
                    results
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href="/dashboard/admin/assessments"
                      className="rounded-lg border border-card-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-page-bg"
                    >
                      View All →
                    </Link>
                  </div>
                </div>
              </>
            )}
      </div>
    </div>
  );
}
