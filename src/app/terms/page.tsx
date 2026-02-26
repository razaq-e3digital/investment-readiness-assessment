import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

export const metadata: Metadata = {
  title: 'Terms of Service — E3 Digital Investor Readiness Assessment',
  description: 'Terms governing the use of the E3 Digital Investor Readiness Assessment Tool.',
};

const LAST_UPDATED = '26 February 2025';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page-bg pt-20">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-10 rounded-xl border border-card-border bg-white p-8 shadow-card">
            <h1 className="mb-2 text-3xl font-bold text-text-primary">Terms of Service</h1>
            <p className="text-sm text-text-muted">
              Last updated:
              {LAST_UPDATED}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 rounded-xl border border-card-border bg-white p-8 shadow-card">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">1. The Service</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                E3 Digital operates the Investor Readiness Assessment Tool at
                {' '}
                <a href="https://assess.e3digital.net" className="text-accent-blue hover:underline">
                  assess.e3digital.net
                </a>
                {' '}
                ("the Service"). The Service provides a free AI-powered assessment to help founders evaluate
                their venture's readiness for seed-stage investment.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">2. No Investment Guarantees</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                The Service provides educational and informational guidance only. Your score and recommendations
                do not guarantee, predict, or imply that you will successfully raise investment. Investment
                outcomes depend on many factors beyond the scope of this assessment.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">3. Not Financial Advice</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                The AI scoring and recommendations provided by the Service are directional guidance and do
                not constitute financial advice, investment advice, or any form of professional financial
                service. You should consult qualified financial advisors before making business or financial
                decisions based on the results of this assessment.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">4. No Liability for Business Decisions</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                E3 Digital is not responsible for any business decisions, investments, or actions taken by
                you based on the results of this assessment. You use the Service and its results at your
                own risk.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">5. Acceptable Use</h2>
              <p className="mb-2 text-sm text-text-secondary">When using the Service, you agree not to:</p>
              <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>Submit false or misleading information</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>Use automated tools to submit assessments in bulk</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>Attempt to reverse-engineer the AI scoring methodology</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>Use the Service for any unlawful purpose</span>
                </li>
              </ul>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">6. Modifications to the Service</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                E3 Digital reserves the right to modify, suspend, or discontinue the Service at any time
                without notice. We may also update these Terms of Service from time to time. Continued use
                of the Service after updates constitutes acceptance of the revised terms.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">7. Intellectual Property</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                All content, design, and code within the Service is the intellectual property of E3 Digital.
                You may not reproduce, distribute, or create derivative works without written permission.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">8. Governing Law</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                These Terms of Service are governed by the laws of England and Wales. Any disputes arising
                from the use of the Service shall be subject to the exclusive jurisdiction of the courts
                of England and Wales.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">9. Contact</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                For questions about these Terms, contact us at
                {' '}
                <a href="mailto:razaq@e3.digital" className="text-accent-blue hover:underline">
                  razaq@e3.digital
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
