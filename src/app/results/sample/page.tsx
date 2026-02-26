import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

export const metadata: Metadata = {
  title: 'Sample Report — E3 Digital Investor Readiness Assessment',
  description: 'See what your investor readiness report looks like. Score: 82/100 — Investor Ready.',
};

// Hardcoded sample data — will be replaced with dynamic data in Phase 4
const sampleData = {
  companyName: 'Acme SaaS Inc.',
  founderName: 'Alex Johnson',
  score: 82,
  readinessLevel: 'Investor Ready',
  scoreBadgeColor: 'bg-score-green-bg text-score-green',
  categories: [
    { name: 'Market Opportunity', score: 88, color: 'bg-score-green' },
    { name: 'Team & Execution', score: 75, color: 'bg-score-blue' },
    { name: 'Product & Technology', score: 84, color: 'bg-score-green' },
    { name: 'Traction & Metrics', score: 80, color: 'bg-score-green' },
    { name: 'Financial Health', score: 70, color: 'bg-score-blue' },
    { name: 'Business Model', score: 85, color: 'bg-score-green' },
    { name: 'Competitive Position', score: 78, color: 'bg-score-blue' },
    { name: 'Go-to-Market Strategy', score: 82, color: 'bg-score-green' },
    { name: 'Pitch Narrative', score: 90, color: 'bg-score-green' },
    { name: 'Investor Fit', score: 85, color: 'bg-score-green' },
  ],
  gaps: [
    {
      title: 'Financial Runway',
      severity: 'Medium',
      severityColor: 'bg-score-orange-bg text-score-orange',
      description: 'Your current runway of 10 months is below the 18-month threshold investors expect before a Series A.',
      recommendation: 'Focus on extending runway through either revenue growth or a small bridge round before approaching institutional investors.',
    },
    {
      title: 'Team Completeness',
      severity: 'Medium',
      severityColor: 'bg-score-orange-bg text-score-orange',
      description: 'The absence of a CTO co-founder raises questions about technical leadership and product scalability.',
      recommendation: 'Either recruit a technical co-founder or fractional CTO, or clearly articulate your technical hiring plan in the pitch.',
    },
    {
      title: 'Customer Retention Data',
      severity: 'Low',
      severityColor: 'bg-score-blue-bg text-score-blue',
      description: 'NRR and churn metrics are not clearly documented, making it harder to demonstrate product-market fit.',
      recommendation: 'Instrument your product to track NRR, MRR churn, and cohort retention, then present 3+ months of data.',
    },
  ],
};

// Gauge component — identical to Hero preview but used in results
function ScoreGauge({ score }: { score: number }) {
  // End angle: 180° − (score/100 × 180°)
  const fillAngleDeg = (score / 100) * 180;
  const endAngleDeg = 180 - fillAngleDeg;
  const endAngleRad = (endAngleDeg * Math.PI) / 180;
  const cx = 100;
  const cy = 120;
  const r = 80;
  const endX = cx + r * Math.cos(endAngleRad);
  const endY = cy - r * Math.sin(endAngleRad);

  const scoreColor
    = score >= 75
      ? '#22c55e'
      : score >= 60
        ? '#3b82f6'
        : score >= 40
          ? '#f97316'
          : '#ef4444';

  return (
    <svg viewBox="0 0 200 145" className="w-48" aria-label={`Score: ${score} out of 100`}>
      <defs>
        <linearGradient id="sampleGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={scoreColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={scoreColor} />
        </linearGradient>
      </defs>
      {/* Track */}
      <path
        d="M 20,120 A 80,80 0 0 0 180,120"
        stroke="#e2e8f0"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      {/* Filled arc */}
      <path
        d={`M 20,120 A 80,80 0 0 0 ${endX.toFixed(1)},${endY.toFixed(1)}`}
        stroke="url(#sampleGaugeGradient)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      {/* Score number */}
      <text
        x="100"
        y="110"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="38"
        fontWeight="700"
        fill="#0f172a"
      >
        {score}
      </text>
      {/* Sub-label */}
      <text x="100" y="132" textAnchor="middle" fontSize="11" fill="#94a3b8">
        out of 100
      </text>
    </svg>
  );
}

export default function SampleResultsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page-bg">
        {/* Sample banner */}
        <div className="border-b border-accent-blue-light bg-accent-blue-light">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-accent-blue sm:text-left">
              <span className="font-semibold">📊 Sample Report</span>
              {' '}
              — This is an example. Start your own assessment to get personalised results.
            </p>
            <Link
              href="/assessment"
              className="shrink-0 rounded-lg bg-accent-blue px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
            >
              Start Free Assessment →
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <p className="mb-1 text-sm text-text-muted">Investor Readiness Report</p>
            <h1 className="text-2xl font-bold text-text-primary">{sampleData.companyName}</h1>
            <p className="text-sm text-text-secondary">{sampleData.founderName}</p>
          </div>

          {/* Score card */}
          <div className="mb-6 rounded-xl border border-card-border bg-white p-6 shadow-card">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ScoreGauge score={sampleData.score} />
              <div>
                <span
                  className={`mb-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${sampleData.scoreBadgeColor}`}
                >
                  ●
                  {' '}
                  {sampleData.readinessLevel}
                </span>
                <h2 className="mb-1 text-xl font-bold text-text-primary">
                  Your Readiness Score:
                  {' '}
                  {sampleData.score}
                  /100
                </h2>
                <p className="max-w-sm text-sm text-text-secondary">
                  Your B2B SaaS venture demonstrates strong investor readiness. A few targeted improvements
                  could significantly strengthen your fundraising position.
                </p>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="mb-6 rounded-xl border border-card-border bg-white p-6 shadow-card">
            <h2 className="mb-5 text-lg font-semibold text-text-primary">Category Breakdown</h2>
            <div className="space-y-4">
              {sampleData.categories.map(category => (
                <div key={category.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{category.name}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {category.score}
                      /100
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-page-bg">
                    <div
                      className={`h-2 rounded-full ${category.color} transition-all`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap analysis */}
          <div className="mb-8 rounded-xl border border-card-border bg-white p-6 shadow-card">
            <h2 className="mb-5 text-lg font-semibold text-text-primary">Top Gaps & Recommendations</h2>
            <div className="space-y-5">
              {sampleData.gaps.map((gap, index) => (
                <div key={gap.title} className="flex gap-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-text-muted/10 text-xs font-semibold text-text-muted">
                    {index + 1}
                  </div>
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">{gap.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gap.severityColor}`}>
                        {gap.severity}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-text-secondary">{gap.description}</p>
                    <p className="rounded-lg bg-accent-blue-light/50 px-3 py-2 text-sm text-accent-blue">
                      <span className="font-semibold">Quick win:</span>
                      {' '}
                      {gap.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl bg-navy p-6 text-center">
            <h2 className="mb-2 text-lg font-bold text-white">Ready for your real score?</h2>
            <p className="mb-4 text-sm text-text-muted">
              This is a sample. Get your personalised results based on your actual business.
            </p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
            >
              Start Your Free Assessment
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
