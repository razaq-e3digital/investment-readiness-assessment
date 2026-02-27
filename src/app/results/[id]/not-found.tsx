import Link from 'next/link';

import Footer from '@/components/landing/Footer';
import ResultsNavbar from '@/components/results/ResultsNavbar';

export default function ResultsNotFound() {
  return (
    <>
      <ResultsNavbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-page-bg px-4 py-16">
        <div className="max-w-md text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
            404
          </p>
          <h1 className="mb-4 text-2xl font-bold text-text-primary">Results not found</h1>
          <p className="mb-8 text-sm text-text-secondary">
            This assessment link may be invalid or the results haven't been generated yet.
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
          >
            Start a New Assessment
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
