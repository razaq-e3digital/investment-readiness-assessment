import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy — E3 Digital Investor Readiness Assessment',
  description: 'How E3 Digital collects, uses, and protects your data.',
};

const LAST_UPDATED = '26 February 2025';

export default function PrivacyPage() {
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
            <h1 className="mb-2 text-3xl font-bold text-text-primary">Privacy Policy</h1>
            <p className="text-sm text-text-muted">
              Last updated:
              {LAST_UPDATED}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 rounded-xl border border-card-border bg-white p-8 shadow-card">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">1. Data Controller</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                E3 Digital is the data controller for the personal data collected through the Investor Readiness
                Assessment Tool at
                {' '}
                <a href="https://assess.e3digital.net" className="text-accent-blue hover:underline">
                  assess.e3digital.net
                </a>
                . For any data-related enquiries, contact us at
                {' '}
                <a href="mailto:razaq@e3.digital" className="text-accent-blue hover:underline">
                  razaq@e3.digital
                </a>
                .
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">2. What Data We Collect</h2>
              <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Assessment responses</strong>
                    {' '}
                    — your answers to all assessment questions
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Contact information</strong>
                    {' '}
                    — name, email address, company name
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">IP address (hashed)</strong>
                    {' '}
                    — stored as a one-way SHA-256 hash for rate limiting; never stored in plain text
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Browser information</strong>
                    {' '}
                    — user agent string for security and debugging purposes
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Usage analytics</strong>
                    {' '}
                    — page views and interaction events (only with your consent)
                  </span>
                </li>
              </ul>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">3. Why We Collect It</h2>
              <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>To generate your personalised investor readiness score and report</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>To send your results and recommendations via email</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>To provide follow-up support and guidance from the E3 Digital team</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>To improve the accuracy and relevance of the assessment tool</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>To prevent abuse via rate limiting</span>
                </li>
              </ul>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">4. Third-Party Services</h2>
              <p className="mb-3 text-sm text-text-secondary">We use the following third-party services to operate the tool:</p>
              <div className="overflow-hidden rounded-lg border border-card-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-page-bg">
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">Service</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">Purpose</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-text-secondary">
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-primary">Clerk</td>
                      <td className="px-4 py-3">Authentication</td>
                      <td className="px-4 py-3">Email, name</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-primary">Railway</td>
                      <td className="px-4 py-3">Hosting & database</td>
                      <td className="px-4 py-3">All stored data</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-primary">Mailgun</td>
                      <td className="px-4 py-3">Email delivery</td>
                      <td className="px-4 py-3">Email, name</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-primary">Brevo</td>
                      <td className="px-4 py-3">CRM / follow-up</td>
                      <td className="px-4 py-3">Email, name, score</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-primary">OpenRouter</td>
                      <td className="px-4 py-3">AI scoring engine</td>
                      <td className="px-4 py-3">Assessment responses</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-primary">Google Analytics</td>
                      <td className="px-4 py-3">Usage analytics</td>
                      <td className="px-4 py-3">Page views (consent required)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-primary">Sentry</td>
                      <td className="px-4 py-3">Error monitoring</td>
                      <td className="px-4 py-3">Error traces (no PII)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">5. Data Retention</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                Assessment data is retained for 2 years from submission. After this period, data is automatically
                deleted. You may request deletion at any time (see Your Rights below).
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">6. Your Rights (GDPR)</h2>
              <p className="mb-3 text-sm text-text-secondary">Under GDPR, you have the right to:</p>
              <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Access</strong>
                    {' '}
                    — request a copy of the data we hold about you
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Correction</strong>
                    {' '}
                    — request that inaccurate data be corrected
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Deletion</strong>
                    {' '}
                    — request that your data be deleted ("right to be forgotten")
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Portability</strong>
                    {' '}
                    — receive your data in a structured, machine-readable format
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-accent-blue">•</span>
                  <span>
                    <strong className="text-text-primary">Objection</strong>
                    {' '}
                    — object to processing for direct marketing purposes
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-sm text-text-secondary">
                To exercise any right, email
                {' '}
                <a href="mailto:razaq@e3.digital" className="text-accent-blue hover:underline">razaq@e3.digital</a>
                .
                We will respond within 30 days.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">7. Cookies</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                We use a cookie consent mechanism on our site. Analytics cookies (Google Analytics) are only set
                after you explicitly accept. We do not use advertising or tracking cookies.
              </p>
            </section>

            <hr className="border-card-border" />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">8. Contact</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                For any questions or concerns about this Privacy Policy or our data practices, please contact us
                at
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
