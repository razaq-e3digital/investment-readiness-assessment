'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// GA4 measurement ID from environment — set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent state
    const stored = localStorage.getItem('cookie-consent');
    setHasConsent(stored === 'accepted');

    // Listen for consent changes dispatched by CookieConsent component
    const handleConsentChange = () => {
      const updated = localStorage.getItem('cookie-consent');
      setHasConsent(updated === 'accepted');
    };

    window.addEventListener('cookie-consent-change', handleConsentChange);
    return () => {
      window.removeEventListener('cookie-consent-change', handleConsentChange);
    };
  }, []);

  if (!GA_MEASUREMENT_ID || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
