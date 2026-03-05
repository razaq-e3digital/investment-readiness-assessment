import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import CookieConsent from '@/components/CookieConsent';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Navbar from '@/components/landing/Navbar';
import WhatYouGet from '@/components/landing/WhatYouGet';

// Lazy-load FAQ (client component with accordion) — below the fold, reduces initial JS bundle
const FAQ = dynamic(() => import('@/components/landing/FAQ'), {
  loading: () => (
    <section className="bg-page-bg py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      </div>
    </section>
  ),
});

export const metadata: Metadata = {
  title: 'E3 Digital — Investor Readiness Assessment',
  description:
    'Find out how investor-ready your B2B SaaS is. Get a free AI-powered score, gap analysis, and actionable recommendations in under 10 minutes.',
  openGraph: {
    title: 'E3 Digital — Investor Readiness Assessment',
    description: 'Free AI-powered investor readiness score for B2B SaaS founders.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <WhatYouGet />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <CookieConsent />
      <GoogleAnalytics />
    </>
  );
}
