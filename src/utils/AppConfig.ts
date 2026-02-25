export const AppConfig = {
  name: 'E3 Digital',
  description: 'Investor Readiness Assessment Tool for seed-stage B2B SaaS founders',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://assess.e3digital.net',
} as const;
