'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

type TimeSeriesPoint = {
  date: string;
  assessments: number;
  bookings: number;
};

type ScoreBucket = {
  range: string;
  count: number;
};

type ReadinessPoint = {
  level: string;
  count: number;
};

type SourcePoint = {
  source: string;
  count: number;
};

type Metrics = {
  total: number;
  avgScore: number | null;
  bookings: number;
  conversionRate: number;
};

export type AnalyticsData = {
  assessmentsOverTime: TimeSeriesPoint[];
  scoreDistribution: ScoreBucket[];
  readinessBreakdown: ReadinessPoint[];
  sourceBreakdown: SourcePoint[];
  metrics: Metrics;
};

// ── Colour helpers ─────────────────────────────────────────────────────────────

const READINESS_COLORS: Record<string, string> = {
  investment_ready: '#22c55e',
  nearly_there: '#3b82f6',
  early_stage: '#f97316',
  too_early: '#ef4444',
};

const READINESS_LABELS: Record<string, string> = {
  investment_ready: 'Investor Ready',
  nearly_there: 'Nearly There',
  early_stage: 'Early Stage',
  too_early: 'Too Early',
};

function getScoreBarColor(range: string): string {
  const min = Number(range.split('-')[0]);
  if (min >= 75) {
    return '#22c55e';
  }
  if (min >= 50) {
    return '#3b82f6';
  }
  if (min >= 25) {
    return '#f97316';
  }
  return '#ef4444';
}

// ── Chart components ──────────────────────────────────────────────────────────

export function AssessmentsOverTimeChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={d => d.slice(5)}
        />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          labelStyle={{ color: '#0f172a', fontWeight: 600 }}
        />
        <Legend iconSize={8} />
        <Line
          type="monotone"
          dataKey="assessments"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          name="Assessments"
        />
        <Line
          type="monotone"
          dataKey="bookings"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          name="Bookings"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ScoreDistributionChart({ data }: { data: ScoreBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          cursor={{ fill: '#f1f5f9' }}
        />
        <Bar dataKey="count" name="Founders" radius={[4, 4, 0, 0]}>
          {data.map(entry => (
            <Cell key={entry.range} fill={getScoreBarColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReadinessBreakdownChart({ data }: { data: ReadinessPoint[] }) {
  const chartData = data.map(d => ({
    ...d,
    label: READINESS_LABELS[d.level] ?? d.level,
    color: READINESS_COLORS[d.level] ?? '#94a3b8',
  }));

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {chartData.map(entry => (
              <Cell key={entry.level} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {chartData.map((item) => {
          const total = chartData.reduce((s, d) => s + d.count, 0);
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.level} className="flex items-center gap-1.5">
              <div className="size-3 shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-text-secondary">
                {item.label}
                {' '}
                (
                {pct}
                %)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SourceBreakdownChart({ data }: { data: SourcePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 45)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
        <YAxis dataKey="source" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={55} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          cursor={{ fill: '#f1f5f9' }}
        />
        <Bar dataKey="count" name="Assessments" fill="#2563eb" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
