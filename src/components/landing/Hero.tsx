import Link from 'next/link';

// Static decorative score gauge illustration — not functional, Phase 4 builds the real one
function ScoreGaugePreview() {
  // Gauge geometry: center (100,120), radius 80, top semicircle
  // Score 82/100 → fill angle = 82% × 180° = 147.6° → end angle = 32.4°
  // End point: x = 100 + 80×cos(32.4°) ≈ 167.5, y = 120 − 80×sin(32.4°) ≈ 77.1
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      {/* Mini card header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Readiness Score
        </span>
        <span className="rounded-full bg-score-green-bg px-2.5 py-1 text-xs font-semibold text-score-green">
          ● Investor Ready
        </span>
      </div>

      {/* SVG gauge */}
      <div className="flex justify-center">
        <svg viewBox="0 0 200 145" className="w-48" aria-hidden="true">
          <defs>
            <linearGradient id="gaugeGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {/* Track — full top semicircle */}
          <path
            d="M 20,120 A 80,80 0 0 0 180,120"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Filled arc — 82/100 score */}
          <path
            d="M 20,120 A 80,80 0 0 0 167.5,77.1"
            stroke="url(#gaugeGreen)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Score number */}
          <text
            x="100"
            y="108"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="40"
            fontWeight="700"
            fill="white"
          >
            82
          </text>
          {/* Sub-label */}
          <text
            x="100"
            y="130"
            textAnchor="middle"
            fontSize="11"
            fill="#94a3b8"
          >
            out of 100
          </text>
        </svg>
      </div>

      {/* Mini category bars */}
      <div className="mt-4 space-y-2.5">
        {[
          { label: 'Market Opportunity', score: 88, color: 'bg-score-green' },
          { label: 'Team & Execution', score: 75, color: 'bg-score-blue' },
          { label: 'Financial Health', score: 70, color: 'bg-score-blue' },
          { label: 'Traction', score: 82, color: 'bg-score-green' },
        ].map(item => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-text-muted">{item.label}</span>
              <span className="text-xs font-semibold text-white">{item.score}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <div
                className={`h-1.5 rounded-full ${item.color}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative bg-navy pt-16">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy-light" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — text content */}
          <div>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-accent-blue-light px-4 py-1.5">
              <span className="text-xs font-semibold text-accent-blue">
                For Non-Technical Founders
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              How Investor-Ready Is Your
              {' '}
              <span className="text-score-green">Startup?</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-text-muted">
              Get a free, AI-powered evaluation of your B2B SaaS venture's
              readiness for investment in under 10 minutes.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-blue-hover"
              >
                Start Free Assessment
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/results/sample"
                className="inline-flex items-center rounded-lg border border-white/30 bg-transparent px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                View Sample Report
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-3">
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {[
                  { color: '#2563eb', initial: 'A' },
                  { color: '#10b981', initial: 'B' },
                  { color: '#8b5cf6', initial: 'C' },
                  { color: '#f59e0b', initial: 'D' },
                ].map(avatar => (
                  <div
                    key={avatar.color}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-navy text-xs font-semibold text-white"
                    style={{ backgroundColor: avatar.color }}
                    aria-hidden="true"
                  >
                    {avatar.initial}
                  </div>
                ))}
              </div>
              <div>
                <span className="text-sm font-medium text-white">Used by 1,000+ founders</span>
                <p className="text-xs text-text-muted">
                  Built by
                  {' '}
                  <a
                    href="https://www.linkedin.com/in/razaqsherif/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    Razaq Sherif
                  </a>
                  , Founder at E3 Digital
                </p>
              </div>
            </div>
          </div>

          {/* Right column — decorative score preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <ScoreGaugePreview />
            </div>
          </div>
        </div>
      </div>

      {/* Wave transition to light background */}
      <div className="relative h-12 overflow-hidden">
        <svg
          viewBox="0 0 1440 48"
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,48 L1440,48 L1440,0 C1080,48 360,0 0,32 Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
}
