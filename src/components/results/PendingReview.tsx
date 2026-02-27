import Link from 'next/link';

type Props = {
  assessmentId: string;
};

export default function PendingReview({ assessmentId }: Props) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-page-bg px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-card-border bg-white p-8 text-center shadow-card">
        {/* Spinner */}
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-accent-blue-light">
          <svg
            className="size-8 animate-spin text-accent-blue"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-xl font-semibold text-text-primary">
          Your results are being processed
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          Our AI is analysing your responses. This usually takes 30–60 seconds. Please check back
          shortly.
        </p>

        <p className="mb-6 text-xs text-text-muted">
          Assessment ID:
          {' '}
          <code className="rounded bg-page-bg px-1.5 py-0.5 font-mono text-xs">
            {assessmentId}
          </code>
        </p>

        <Link
          href={`/results/${assessmentId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Results
        </Link>
      </div>
    </main>
  );
}
