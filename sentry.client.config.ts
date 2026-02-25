// Sentry client-side initialisation — runs in the browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import * as Spotlight from '@spotlightjs/spotlight';

const isProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // 10% of transactions in production, 100% in development
  tracesSampleRate: isProd ? 0.1 : 1,

  // Session replay: capture 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  debug: false,
});

if (!isProd) {
  Spotlight.init();
}
