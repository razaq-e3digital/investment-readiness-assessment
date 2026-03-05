import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import AdminAssessmentActions from '@/components/admin/AdminAssessmentActions';
import CategoryBreakdown from '@/components/results/CategoryBreakdown';
import GapCard from '@/components/results/GapCard';
import NextSteps from '@/components/results/NextSteps';
import type { ReadinessLevel } from '@/components/results/ReadinessLevelBadge';
import ReadinessLevelBadge from '@/components/results/ReadinessLevelBadge';
import ScoreGauge from '@/components/results/ScoreGauge';

export const metadata: Metadata = {
  title: 'Assessment Detail — Admin',
  robots: 'noindex, nofollow',
};

type GapData = { title: string; currentState: string; recommendedActions: string[] };

type AssessmentDetail = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactCompany: string | null;
  contactLinkedin: string | null;
  contactSource: string | null;
  responses: Record<string, unknown>;
  overallScore: number | null;
  readinessLevel: string | null;
  categoryScores: { name: string; score: number }[];
  topGaps: GapData[];
  quickWins: string[];
  mediumTermRecommendations: string[];
  aiScored: boolean;
  aiModel: string | null;
  aiProcessingTimeMs: number | null;
  emailSent: boolean;
  brevoSynced: boolean;
  booked: boolean;
  bookedAt: string | null;
  clerkUserId: string | null;
  recaptchaScore: number | null;
  createdAt: string;
  updatedAt: string | null;
  emailLogs: {
    id: number;
    status: string;
    sentAt: string | null;
    deliveredAt: string | null;
    openedAt: string | null;
    clickedAt: string | null;
    failedAt: string | null;
    failureReason: string | null;
    retryCount: number;
  }[];
};

const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

async function fetchAssessment(id: string): Promise<AssessmentDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/assessments/${id}`, {
      cache: 'no-store',
      headers: { 'x-internal-request': '1' },
    });
    if (!res.ok) {
      return null;
    }
    return res.json() as Promise<AssessmentDetail>;
  } catch {
    return null;
  }
}

function StatusRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-right text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

export default async function AdminAssessmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const assessment = await fetchAssessment(id);
  if (!assessment) {
    notFound();
  }

  const readinessLevel = (assessment.readinessLevel ?? 'early_stage') as ReadinessLevel;
  const overallScore = assessment.overallScore ?? 0;
  const topGaps = assessment.topGaps;
  const quickWins = assessment.quickWins;
  const mediumTerm = assessment.mediumTermRecommendations;

  // Time label for CategoryBreakdown
  const hoursAgo = Math.floor(
    (Date.now() - new Date(assessment.createdAt).getTime()) / (1000 * 60 * 60),
  );
  const timeLabel = hoursAgo < 1 ? 'Just now' : `${hoursAgo}h ago`;

  // Latest email status
  const latestEmail = assessment.emailLogs.at(-1);

  return (
    <div className="max-w-5xl">
      {/* Back nav + header */}
      <div className="mb-6">
        <Link
          href="/dashboard/admin/assessments"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to assessments
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{assessment.contactName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span>{assessment.contactEmail}</span>
              {assessment.contactCompany && (
                <>
                  <span>·</span>
                  <span>{assessment.contactCompany}</span>
                </>
              )}
              {assessment.contactLinkedin && (
                <>
                  <span>·</span>
                  <a
                    href={assessment.contactLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent-blue hover:underline"
                  >
                    LinkedIn
                    <ExternalLink className="size-3" />
                  </a>
                </>
              )}
              {assessment.contactSource && (
                <>
                  <span>·</span>
                  <span className="rounded-full bg-page-bg px-2.5 py-0.5 text-xs">
                    {assessment.contactSource}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Submitted
              {' '}
              {new Date(assessment.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Action buttons */}
          <AdminAssessmentActions
            assessmentId={assessment.id}
            initialBooked={assessment.booked}
            founderName={assessment.contactName}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column (score + gaps) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Score hero */}
          {assessment.aiScored
            ? (
                <div className="flex flex-col items-center gap-6 rounded-xl bg-navy p-8 sm:flex-row">
                  <ScoreGauge score={overallScore} />
                  <div className="text-center sm:text-left">
                    <ReadinessLevelBadge level={readinessLevel} />
                    <p className="mt-3 text-sm text-text-muted">
                      Investor Readiness Score
                    </p>
                    <p className="mt-1 text-4xl font-bold text-white">
                      {overallScore}
                      /100
                    </p>
                  </div>
                </div>
              )
            : (
                <div className="rounded-xl border border-card-border bg-white p-8 text-center shadow-card">
                  <p className="text-text-muted">Assessment is pending AI scoring.</p>
                </div>
              )}

          {/* Category breakdown */}
          {assessment.categoryScores.length > 0 && (
            <CategoryBreakdown categories={assessment.categoryScores} timeLabel={timeLabel} />
          )}

          {/* Top 3 gaps */}
          {topGaps.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Top Gaps</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {topGaps.map((gap, index) => (
                  <GapCard key={gap.title} gap={gap} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Next steps */}
          {(quickWins.length > 0 || mediumTerm.length > 0) && (
            <NextSteps quickWins={quickWins} mediumTerm={mediumTerm} />
          )}

          {/* Raw form responses */}
          <details className="rounded-xl border border-card-border bg-white shadow-card">
            <summary className="cursor-pointer select-none px-6 py-4 text-sm font-semibold text-text-primary">
              Raw Form Responses (
              {Object.keys(assessment.responses).length}
              {' '}
              fields)
            </summary>
            <div className="divide-y divide-card-border border-t border-card-border">
              {Object.entries(assessment.responses).map(([key, value]) => (
                <div key={key} className="px-6 py-3">
                  <p className="text-xs font-medium uppercase text-text-muted">{key}</p>
                  <p className="mt-0.5 text-sm text-text-primary">
                    {Array.isArray(value)
                      ? (value as string[]).join(', ')
                      : String(value ?? '—')}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Status sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-card-border bg-white p-5 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Status</h3>
            <div className="divide-y divide-card-border">
              <StatusRow
                label="AI Scored"
                value={
                  assessment.aiScored
                    ? <span className="text-score-green">✓ Yes</span>
                    : <span className="text-text-muted">Pending</span>
                }
              />
              {assessment.aiModel && (
                <StatusRow label="AI Model" value={assessment.aiModel} />
              )}
              {assessment.aiProcessingTimeMs && (
                <StatusRow
                  label="Processing Time"
                  value={`${(assessment.aiProcessingTimeMs / 1000).toFixed(1)}s`}
                />
              )}
              <StatusRow
                label="Email"
                value={
                  assessment.emailSent
                    ? <span className="capitalize text-score-green">{latestEmail?.status ?? 'sent'}</span>
                    : <span className="text-text-muted">Not sent</span>
                }
              />
              <StatusRow
                label="Brevo CRM"
                value={
                  assessment.brevoSynced
                    ? <span className="text-score-green">✓ Synced</span>
                    : <span className="text-text-muted">Not synced</span>
                }
              />
              <StatusRow
                label="Booking"
                value={
                  assessment.booked
                    ? (
                        <span className="text-score-green">
                          ✓ Booked
                          {assessment.bookedAt && (
                            <span className="block text-xs text-text-muted">
                              {new Date(assessment.bookedAt).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                      )
                    : <span className="text-text-muted">No</span>
                }
              />
              <StatusRow
                label="Account"
                value={
                  assessment.clerkUserId
                    ? <span className="text-score-green">✓ Created</span>
                    : <span className="text-text-muted">No</span>
                }
              />
              {assessment.recaptchaScore !== null && (
                <StatusRow label="reCAPTCHA" value={assessment.recaptchaScore.toFixed(2)} />
              )}
            </div>
          </div>

          {/* Email timeline */}
          {assessment.emailLogs.length > 0 && (
            <div className="rounded-xl border border-card-border bg-white p-5 shadow-card">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Email Timeline</h3>
              <div className="space-y-2">
                {assessment.emailLogs.map(log => (
                  <div key={log.id} className="text-xs">
                    <span className="font-medium capitalize text-text-primary">{log.status}</span>
                    {log.openedAt && (
                      <span className="ml-2 text-text-muted">
                        Opened
                        {' '}
                        {new Date(log.openedAt).toLocaleDateString()}
                      </span>
                    )}
                    {log.deliveredAt && !log.openedAt && (
                      <span className="ml-2 text-text-muted">
                        Delivered
                        {' '}
                        {new Date(log.deliveredAt).toLocaleDateString()}
                      </span>
                    )}
                    {log.failureReason && (
                      <span className="ml-2 text-score-red">{log.failureReason}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link to public results */}
          <a
            href={`/results/${assessment.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-white px-4 py-3 text-sm font-medium text-text-secondary shadow-card transition-colors hover:bg-page-bg hover:text-text-primary"
          >
            <ExternalLink className="size-4" />
            View public results page
          </a>
        </div>
      </div>
    </div>
  );
}
