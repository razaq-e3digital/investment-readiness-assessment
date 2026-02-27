'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  assessmentId: string;
  signUpUrl: string;
  signInUrl: string;
};

export default function SaveResults({ assessmentId, signUpUrl, signInUrl }: Props) {
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // On mount: if ?claim=1 is present in URL, attempt to link the assessment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('claim') !== '1') {
      return;
    }

    setClaiming(true);
    fetch(`/api/assessment/${assessmentId}/claim`, { method: 'PATCH' })
      .then((res) => {
        if (res.ok) {
          setClaimed(true);
          // Remove the ?claim=1 param from the browser URL without a reload
          const url = new URL(window.location.href);
          url.searchParams.delete('claim');
          window.history.replaceState({}, '', url.toString());
        }
      })
      .catch(() => {
        // Non-critical — silently swallow; user can still see results
      })
      .finally(() => {
        setClaiming(false);
      });
  }, [assessmentId]);

  if (claiming) {
    return (
      <div className="border-t border-card-border py-10 text-center">
        <p className="text-sm text-text-muted">Saving your results…</p>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="border-t border-card-border py-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-score-green-bg px-4 py-2 text-sm font-medium text-score-green">
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Results saved to your account
        </div>
      </div>
    );
  }

  const redirectUrl = encodeURIComponent(`/results/${assessmentId}?claim=1`);

  return (
    <div className="border-t border-card-border py-10 text-center">
      <h3 className="mb-2 text-lg font-semibold text-text-primary">Save Your Results</h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-text-secondary">
        Create a free account to access your results anytime and track your progress.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={`${signUpUrl}?redirect_url=${redirectUrl}`}
          className="rounded-lg bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
        >
          Create Free Account
        </a>
        <Link
          href={`${signInUrl}?redirect_url=${redirectUrl}`}
          className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
