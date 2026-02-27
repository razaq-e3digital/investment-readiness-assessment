import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import Footer from '@/components/landing/Footer';
import CategoryBreakdown from '@/components/results/CategoryBreakdown';
import ConsultationCTA from '@/components/results/ConsultationCTA';
import GapCard from '@/components/results/GapCard';
import NextSteps from '@/components/results/NextSteps';
import PendingReview from '@/components/results/PendingReview';
import type { ReadinessLevel } from '@/components/results/ReadinessLevelBadge';
import ReadinessLevelBadge from '@/components/results/ReadinessLevelBadge';
import ResultsNavbar from '@/components/results/ResultsNavbar';
import SaveResults from '@/components/results/SaveResults';
import ScoreGauge from '@/components/results/ScoreGauge';
import StickyMobileCTA from '@/components/results/StickyMobileCTA';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { assessments } from '@/models/Schema';

type Props = {
  params: { id: string };
};

type GapData = {
  title: string;
  currentState: string;
  recommendedActions: string[];
};

const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

// Deduplicate DB calls between generateMetadata and the page component
const getAssessment = cache(async (id: string) => {
  const result = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);
  return result[0] ?? null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!UUID_REGEX.test(params.id)) {
    return { title: 'Results Not Found | E3 Digital', robots: 'noindex, nofollow' };
  }

  try {
    const assessment = await getAssessment(params.id);
    if (!assessment) {
      return { title: 'Results Not Found | E3 Digital', robots: 'noindex, nofollow' };
    }

    const name = assessment.contactCompany ?? assessment.contactName;
    return {
      title: `${name}'s Investor Readiness Score | E3 Digital`,
      description: 'See your personalised investor readiness assessment results.',
      robots: 'noindex, nofollow',
    };
  } catch {
    return {
      title: 'Results | E3 Digital',
      robots: 'noindex, nofollow',
    };
  }
}

const READINESS_SUMMARY: Record<ReadinessLevel, string> = {
  investment_ready:
    'Your startup shows strong fundamentals across key investor criteria. You\'re well-positioned to approach investors.',
  nearly_there:
    'You\'re making good progress, but there are a few areas that need attention before you\'ll be investor-ready.',
  early_stage:
    'You\'ve got the foundations, but significant work is needed across several key areas before approaching investors.',
  too_early:
    'Focus on building your product and validating your market before seeking investment. Here\'s where to start.',
};

export default async function ResultsPage({ params }: Props) {
  const { id } = params;

  // ── Validate UUID ─────────────────────────────────────────────────────────
  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  // ── Fetch assessment ──────────────────────────────────────────────────────
  const assessment = await getAssessment(id);

  if (!assessment) {
    notFound();
  }

  const bookingUrl = Env.NEXT_PUBLIC_ZOHO_BOOKING_URL ?? '#';
  const signUpUrl = Env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
  const signInUrl = Env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;

  // ── Pending state ─────────────────────────────────────────────────────────
  if (!assessment.aiScored) {
    return (
      <>
        <ResultsNavbar />
        <PendingReview assessmentId={id} />
        <Footer />
      </>
    );
  }

  // ── Parse JSONB fields ────────────────────────────────────────────────────
  const rawCategoryScores = assessment.categoryScores as Record<string, number> | null;
  const categoryScores = rawCategoryScores
    ? Object.entries(rawCategoryScores).map(([name, score]) => ({ name, score }))
    : [];

  const topGaps = (assessment.topGaps ?? []) as GapData[];
  const quickWins = (assessment.quickWins ?? []) as string[];
  const mediumTerm = (assessment.recommendations ?? []) as string[];

  const readinessLevel = (assessment.readinessLevel ?? 'early_stage') as ReadinessLevel;
  const overallScore = assessment.overallScore ?? 0;

  const summary = READINESS_SUMMARY[readinessLevel] ?? READINESS_SUMMARY.early_stage;

  // Time since assessment for the category breakdown timestamp
  const hoursAgo = Math.floor(
    (Date.now() - assessment.createdAt.getTime()) / (1000 * 60 * 60),
  );
  const timeLabel
    = hoursAgo < 1 ? 'Just now' : hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;

  return (
    <>
      <ResultsNavbar />

      <main>
        {/* ── Dark navy hero ──────────────────────────────────────────────── */}
        <section className="bg-navy px-4 pb-16 pt-12 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <ReadinessLevelBadge level={readinessLevel} />

            <div className="mt-8">
              <ScoreGauge score={overallScore} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-white">
              Your Investor Readiness Score
            </h1>
            <p className="mt-3 max-w-[600px] text-base text-text-muted">{summary}</p>

            {/* Smooth-scroll to detail sections */}
            <a
              href="#details"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Full Report
            </a>
          </div>
        </section>

        {/* ── Detail sections ─────────────────────────────────────────────── */}
        <div id="details" className="bg-page-bg">
          <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
            {/* Category Breakdown */}
            <CategoryBreakdown categories={categoryScores} timeLabel={timeLabel} />

            {/* Top 3 Gaps */}
            {topGaps.length > 0 && (
              <div>
                <h2 className="mb-6 text-xl font-semibold text-text-primary">
                  Top 3 Gaps to Address
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {topGaps.map((gap, index) => (
                    <GapCard key={gap.title} gap={gap} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {(quickWins.length > 0 || mediumTerm.length > 0) && (
              <NextSteps quickWins={quickWins} mediumTerm={mediumTerm} />
            )}
          </div>
        </div>

        {/* ── Consultation CTA ────────────────────────────────────────────── */}
        <ConsultationCTA bookingUrl={bookingUrl} />

        {/* ── Save results ────────────────────────────────────────────────── */}
        <div className="bg-page-bg">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SaveResults
              assessmentId={id}
              signUpUrl={signUpUrl}
              signInUrl={signInUrl}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Sticky mobile CTA — rendered outside main, fixed position */}
      <StickyMobileCTA bookingUrl={bookingUrl} />
    </>
  );
}
