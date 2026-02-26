import Link from 'next/link';

const checkmarks = [
  'Personalised readiness score out of 100',
  '10-category breakdown of investor criteria',
  'Top 3 gaps with specific recommendations',
  'Quick wins you can implement this week',
];

type FeatureCard = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
};

const featureCards: FeatureCard[] = [
  {
    iconBg: 'bg-accent-blue-light',
    icon: (
      <svg className="size-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    title: 'Readiness Score',
    description: 'A single score out of 100 reflecting your overall investor readiness.',
  },
  {
    iconBg: 'bg-score-orange-bg',
    icon: (
      <svg className="size-5 text-score-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: 'Gap Analysis',
    description: 'Identifies your top 3 critical gaps holding you back from funding.',
  },
  {
    iconBg: 'bg-score-green-bg',
    icon: (
      <svg className="size-5 text-score-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Financial Health Check',
    description: 'Assessment of your unit economics, runway, and financial story.',
  },
  {
    iconBg: 'bg-pink-100',
    icon: (
      <svg className="size-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: 'Pitch Deck Audit',
    description: 'Evaluation of your narrative, structure, and key slide content.',
  },
];

export default function WhatYouGet() {
  return (
    <section id="what-you-get" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — text */}
          <div>
            <h2 className="mb-3 text-3xl font-bold text-text-primary">What You'll Get</h2>
            <p className="mb-8 text-base text-text-secondary">
              Comprehensive insights to strengthen your fundraising position
            </p>

            {/* Checklist */}
            <ul className="mb-8 space-y-3">
              {checkmarks.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-score-green-bg">
                    <svg className="size-3 text-score-green" viewBox="0 0 12 12" fill="currentColor">
                      <path fillRule="evenodd" d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-sm text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/results/sample"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-blue hover:text-accent-blue-hover"
            >
              See Example Report
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Right column — 2×2 feature card grid */}
          <div className="grid grid-cols-2 gap-4">
            {featureCards.map(card => (
              <div
                key={card.title}
                className="rounded-xl border border-card-border bg-white p-5 shadow-card"
              >
                <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                  {card.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-text-primary">{card.title}</h3>
                <p className="text-xs leading-relaxed text-text-secondary">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
