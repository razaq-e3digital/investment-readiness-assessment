// Sentry server-side initialisation — runs in Node.js and Edge runtimes.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const isProd = process.env.NODE_ENV === 'production';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      // 10% of transactions in production, 100% in development
      tracesSampleRate: isProd ? 0.1 : 1,
      spotlight: !isProd,
      debug: false,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: isProd ? 0.1 : 1,
      spotlight: !isProd,
      debug: false,
    });
  }
}
