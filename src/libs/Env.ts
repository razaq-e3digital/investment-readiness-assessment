import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const Env = createEnv({
  server: {
    // Auth
    CLERK_SECRET_KEY: z.string().min(1),
    // Database — required at runtime, optional at build time
    DATABASE_URL: z.string().min(1).optional(),
    // Error monitoring — optional locally, required in production
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    // Email
    MAILGUN_API_KEY: z.string().optional(),
    MAILGUN_DOMAIN: z.string().optional(),
    MAILGUN_WEBHOOK_SIGNING_KEY: z.string().optional(),
    // CRM
    BREVO_API_KEY: z.string().optional(),
    // AI Scoring
    OPENROUTER_API_KEY: z.string().optional(),
    AI_MODEL: z.string().optional(),
    // Bot prevention
    RECAPTCHA_SECRET_KEY: z.string().optional(),
  },
  client: {
    // Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
    // Error monitoring
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    // Bot prevention
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
    // App URL
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    // Booking
    NEXT_PUBLIC_ZOHO_BOOKING_URL: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // Destructure all keys manually
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    MAILGUN_WEBHOOK_SIGNING_KEY: process.env.MAILGUN_WEBHOOK_SIGNING_KEY,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ZOHO_BOOKING_URL: process.env.NEXT_PUBLIC_ZOHO_BOOKING_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
});
