'use client';

import { useEffect, useState } from 'react';

import type { AnalyticsData } from '@/components/admin/AnalyticsCharts';
import {
  AssessmentsOverTimeChart,
  ReadinessBreakdownChart,
  ScoreDistributionChart,
  SourceBreakdownChart,
} from '@/components/admin/AnalyticsCharts';

type Range = '30' | '90' | 'all';

const RANGES: { label: string; value: Range }[] = [
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: 'All time', value: 'all' },
];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>('30');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then(r => r.json() as Promise<AnalyticsData>)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  const metrics = data?.metrics;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Assessment trends and performance metrics
          </p>
        </div>

        {/* Time range toggle */}
        <div className="flex items-center rounded-lg border border-card-border bg-white p-1 shadow-card">
          {RANGES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                range === r.value
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: metrics?.total ?? '—' },
          { label: 'Avg Score', value: metrics?.avgScore !== null && metrics?.avgScore !== undefined ? metrics.avgScore : '—' },
          { label: 'Bookings', value: metrics?.bookings ?? '—' },
          { label: 'Conversion', value: metrics?.conversionRate !== undefined ? `${metrics.conversionRate}%` : '—' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-card-border bg-white p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-text-primary">{item.value}</p>
            <p className="mt-0.5 text-xs text-text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      {loading
        ? (
            <div className="py-20 text-center text-sm text-text-muted">Loading charts…</div>
          )
        : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Assessments over time */}
              <div className="rounded-xl border border-card-border bg-white p-6 shadow-card lg:col-span-2">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  Assessments over time
                </h2>
                {(data?.assessmentsOverTime.length ?? 0) > 0
                  ? <AssessmentsOverTimeChart data={data!.assessmentsOverTime} />
                  : <EmptyChart />}
              </div>

              {/* Score distribution */}
              <div className="rounded-xl border border-card-border bg-white p-6 shadow-card">
                <h2 className="mb-4 text-base font-semibold text-text-primary">Score distribution</h2>
                {data?.scoreDistribution.some(d => d.count > 0)
                  ? <ScoreDistributionChart data={data.scoreDistribution} />
                  : <EmptyChart />}
              </div>

              {/* Readiness breakdown */}
              <div className="rounded-xl border border-card-border bg-white p-6 shadow-card">
                <h2 className="mb-4 text-base font-semibold text-text-primary">Readiness breakdown</h2>
                {(data?.readinessBreakdown.length ?? 0) > 0
                  ? <ReadinessBreakdownChart data={data!.readinessBreakdown} />
                  : <EmptyChart />}
              </div>

              {/* Source breakdown */}
              <div className="rounded-xl border border-card-border bg-white p-6 shadow-card lg:col-span-2">
                <h2 className="mb-4 text-base font-semibold text-text-primary">Traffic sources</h2>
                {(data?.sourceBreakdown.length ?? 0) > 0
                  ? <SourceBreakdownChart data={data!.sourceBreakdown} />
                  : <EmptyChart />}
              </div>
            </div>
          )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg bg-page-bg">
      <p className="text-sm text-text-muted">No data yet for this period.</p>
    </div>
  );
}
