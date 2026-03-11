import { fileURLToPath } from 'node:url';

import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createJiti from 'jiti';

// Validate environment variables at build time
const jiti = createJiti(fileURLToPath(import.meta.url));
jiti('./src/libs/Env');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// ── Content Security Policy ───────────────────────────────────────────────────
// Clerk, Google Analytics, reCAPTCHA, Sentry, and Next.js all require specific
// sources. In development, `unsafe-eval` is needed for fast refresh.
const isDev = process.env.NODE_ENV === 'development';

const cspHeader = [
  // Default: only allow same-origin
  `default-src 'self'`,
  // Scripts: self + Sentry tunnel + GA4 + reCAPTCHA + Clerk + Next.js HMR
  `script-src 'self' 'unsafe-inline'${isDev ? ' \'unsafe-eval\'' : ''} https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.googletagmanager.com https://va.vercel-scripts.com`,
  // Styles: self + inline (required by Tailwind / next-themes)
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  // Fonts: self + Google Fonts only. Browser extensions (e.g. Perplexity AI) may
  // inject fonts from r2cdn.perplexity.ai or data: URIs and trigger CSP violations
  // in the user's console — this is expected and intentional; do not add data: or
  // third-party CDNs here.
  `font-src 'self' https://fonts.gstatic.com`,
  // Images: self + data URIs + GA + Clerk avatar CDN
  `img-src 'self' data: https://img.clerk.com https://www.googletagmanager.com https://www.google-analytics.com`,
  // Connect: API calls from browser (Sentry, GA4, Clerk, reCAPTCHA, OpenRouter)
  // Sentry: use *.ingest.de.sentry.io (EU endpoint). Mid-hostname wildcards like
  // o*.ingest.sentry.io are invalid CSP syntax and are silently ignored by browsers.
  `connect-src 'self' https://*.ingest.de.sentry.io https://www.google-analytics.com https://analytics.google.com https://*.clerk.accounts.dev https://clerk.e3digital.net https://openrouter.ai`,
  // Frames: Clerk uses iframes for OAuth popups; reCAPTCHA uses iframes
  `frame-src https://accounts.google.com https://www.google.com/recaptcha/ https://*.clerk.accounts.dev`,
  // Workers: Next.js service workers in production
  `worker-src 'self' blob:`,
  // Disallow object/embed tags
  `object-src 'none'`,
  // Restrict base URI to same origin
  `base-uri 'self'`,
  // Only allow form submissions to same origin
  `form-action 'self'`,
  // Prevent framing of this site (anti-clickjacking)
  `frame-ancestors 'none'`,
  // Upgrade insecure requests in production
  ...(isDev ? [] : [`upgrade-insecure-requests`]),
].join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

/** @type {import('next').NextConfig} */
export default withSentryConfig(
  bundleAnalyzer({
    eslint: {
      dirs: ['.'],
    },
    poweredByHeader: false,
    reactStrictMode: true,
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ];
    },
  }),
  {
    org: process.env.SENTRY_ORG ?? 'e3-digital',
    project: process.env.SENTRY_PROJECT ?? 'investment-readiness-assessment',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Disable Sentry telemetry
    telemetry: false,
  },
);
