import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="bg-navy py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to see where you stand?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-text-muted">
            Get your personalised investor readiness score in under 10 minutes.
            Free, AI-powered, and built for non-technical founders.
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-blue-hover"
          >
            Start Assessment
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="mt-4 text-xs text-text-muted">
            Free forever · No credit card required · Results in minutes
          </p>
        </div>
      </div>
    </section>
  );
}
