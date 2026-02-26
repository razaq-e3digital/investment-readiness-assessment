'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ConsentState = 'accepted' | 'declined' | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | 'loading'>('loading');

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent') as ConsentState | null;
    setConsent(stored);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsent('accepted');
    window.dispatchEvent(new Event('cookie-consent-change'));
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setConsent('declined');
    window.dispatchEvent(new Event('cookie-consent-change'));
  };

  // Don't render during SSR hydration, or if user already made a choice
  if (consent !== null) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="fixed inset-x-4 bottom-4 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-md"
    >
      <div className="rounded-xl border border-card-border bg-white p-5 shadow-lg">
        <p className="mb-4 text-sm leading-relaxed text-text-secondary">
          We use cookies to analyse site traffic and improve your experience.
          {' '}
          <Link
            href="/privacy"
            className="font-medium text-accent-blue underline hover:text-accent-blue-hover"
          >
            Learn more
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-page-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
