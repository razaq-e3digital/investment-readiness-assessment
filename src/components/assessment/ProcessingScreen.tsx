'use client';

import { useEffect, useRef, useState } from 'react';

import type { AssessmentFormData } from '@/types/assessment';

// ── Types ─────────────────────────────────────────────────────────────────────

type SubmitApiResponse =
  | { success: true; assessmentId: string; redirectUrl: string; aiPending?: boolean }
  | { success: false; error: string; errors?: Record<string, string>; retryAfter?: number; message?: string };

type ErrorState =
  | { kind: 'rate_limited'; retryAfter: number; message: string }
  | { kind: 'captcha_failed' }
  | { kind: 'validation_error'; errors: Record<string, string> }
  | { kind: 'network_error' }
  | { kind: 'internal_error'; message: string };

type ProcessingScreenProps = {
  formData: AssessmentFormData;
  recaptchaToken: string;
  onReturnToForm: (errors?: Record<string, string>) => void;
};

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = ['Analyzing responses', 'Scoring 10 criteria', 'Generating recommendations'] as const;
type StepStatus = 'pending' | 'active' | 'complete';

function getStepStatus(stepIndex: number, phase: number): StepStatus {
  if (phase > stepIndex) {
    return 'complete';
  }
  if (phase === stepIndex) {
    return 'active';
  }
  return 'pending';
}

// ── API call ──────────────────────────────────────────────────────────────────

async function submitAssessment(
  formData: AssessmentFormData,
  recaptchaToken: string,
): Promise<SubmitApiResponse> {
  const response = await fetch('/api/assessment/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses: formData, recaptchaToken }),
  });
  return response.json() as Promise<SubmitApiResponse>;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SpinnerCircle({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" stroke="#e2e8f0" strokeWidth="3" />
      <path
        d="M 16 3 A 13 13 0 0 1 29 16"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckCircle() {
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-score-green">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function PendingCircle() {
  return (
    <div
      className="size-8 rounded-full border-2 border-card-border"
      aria-hidden="true"
    />
  );
}

function StepItem({ label, status }: { label: string; status: StepStatus }) {
  const labelColor
    = status === 'complete'
      ? 'text-text-primary'
      : status === 'active'
        ? 'text-accent-blue'
        : 'text-text-muted';

  const statusText
    = status === 'complete' ? 'Complete' : status === 'active' ? 'Processing...' : 'Waiting';

  const statusColor
    = status === 'complete'
      ? 'text-score-green'
      : status === 'active'
        ? 'text-accent-blue'
        : 'text-text-muted';

  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        {status === 'complete' && <CheckCircle />}
        {status === 'active' && <SpinnerCircle />}
        {status === 'pending' && <PendingCircle />}
      </div>

      <div className="flex flex-1 items-center justify-between">
        <span className={`text-sm font-medium ${labelColor}`}>
          {label}
        </span>
        <span className={`text-xs ${statusColor}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}

// ── Error display ─────────────────────────────────────────────────────────────

function ErrorCard({
  error,
  onRetry,
  onReturnToForm,
}: {
  error: ErrorState;
  onRetry: () => void;
  onReturnToForm: () => void;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-white p-8 shadow-card">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-score-red-bg text-score-red">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {error.kind === 'rate_limited' && (
        <>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">Submission limit reached</h2>
          <p className="mb-6 text-sm text-text-secondary">
            {error.message}
            {' '}
            Please wait
            {' '}
            {Math.ceil(error.retryAfter / 60)}
            {' '}
            minutes before trying again.
          </p>
          <button
            type="button"
            onClick={onReturnToForm}
            className="rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue-hover"
          >
            Back to form
          </button>
        </>
      )}

      {error.kind === 'captcha_failed' && (
        <>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">Verification failed</h2>
          <p className="mb-6 text-sm text-text-secondary">
            We could not verify your submission. Please try again.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue-hover"
          >
            Try again
          </button>
        </>
      )}

      {error.kind === 'validation_error' && (
        <>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">Validation error</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Some fields need to be corrected. Please go back and fix the highlighted issues.
          </p>
          <button
            type="button"
            onClick={onReturnToForm}
            className="rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue-hover"
          >
            Back to form
          </button>
        </>
      )}

      {error.kind === 'network_error' && (
        <>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">Connection error</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Could not reach the server. Check your connection and try again.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue-hover"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={onReturnToForm}
              className="rounded-lg border border-card-border px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-page-bg"
            >
              Back to form
            </button>
          </div>
        </>
      )}

      {error.kind === 'internal_error' && (
        <>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">Something went wrong</h2>
          <p className="mb-6 text-sm text-text-secondary">
            {error.message}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue-hover"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onReturnToForm}
              className="rounded-lg border border-card-border px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-page-bg"
            >
              Back to form
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main ProcessingScreen component ──────────────────────────────────────────

export default function ProcessingScreen({
  formData,
  recaptchaToken,
  onReturnToForm,
}: ProcessingScreenProps) {
  // phase 0 = Analyzing (step 0 active)
  // phase 1 = Scoring (step 1 active)
  // phase 2 = Generating (step 2 active)
  // phase 3 = Done (all complete, redirecting)
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [error, setError] = useState<ErrorState | null>(null);
  const apiResultRef = useRef<{ redirectUrl: string } | null>(null);
  const [attemptKey, setAttemptKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();

    const run = async () => {
      try {
        const result = await submitAssessment(formData, recaptchaToken);

        if (!mounted) {
          return;
        }

        if (!result.success) {
          if (result.error === 'rate_limited') {
            setError({ kind: 'rate_limited', retryAfter: result.retryAfter ?? 3600, message: result.message ?? '' });
          } else if (result.error === 'captcha_failed') {
            setError({ kind: 'captcha_failed' });
          } else if (result.errors) {
            setError({ kind: 'validation_error', errors: result.errors });
          } else {
            setError({ kind: 'internal_error', message: result.message ?? 'Something went wrong. Please try again.' });
          }
          return;
        }

        // Ensure minimum 1.5s elapsed so user sees step 0 → 1 transition
        const elapsed = Date.now() - startTime;
        const minWait = Math.max(0, 1500 - elapsed);
        await new Promise<void>(resolve => setTimeout(resolve, minWait));

        if (!mounted) {
          return;
        }

        apiResultRef.current = { redirectUrl: result.redirectUrl };
        setPhase(2);

        // Show "Generating recommendations" briefly, then redirect
        setTimeout(() => {
          if (mounted) {
            setPhase(3);
            window.location.href = result.redirectUrl;
          }
        }, 800);
      } catch {
        if (mounted) {
          setError({ kind: 'network_error' });
        }
      }
    };

    // Advance step 0 → 1 after 1.5 seconds regardless of API state
    const step0Timer = setTimeout(() => {
      if (mounted) {
        setPhase(prev => (prev < 1 ? 1 : prev));
      }
    }, 1500);

    void run();

    return () => {
      mounted = false;
      clearTimeout(step0Timer);
    };
  }, [formData, recaptchaToken, attemptKey]);

  const progressPct = phase === 0 ? 10 : phase === 1 ? 45 : phase === 2 ? 85 : 100;

  const handleRetry = () => {
    setError(null);
    setPhase(0);
    setAttemptKey(k => k + 1);
  };

  const handleReturnToForm = () => {
    if (error?.kind === 'validation_error') {
      onReturnToForm(error.errors);
    } else {
      onReturnToForm();
    }
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between border-b border-card-border bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-accent-blue">
            <span className="text-sm font-bold text-white">E3</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">E3 Digital</span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-card-border bg-page-bg px-3 py-1.5">
          <span
            className="inline-block size-2 rounded-full bg-accent-blue"
            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            STATUS
          </span>
          <span className="text-xs font-semibold text-text-secondary">
            {error ? 'Error' : phase < 3 ? 'Processing' : 'Complete'}
          </span>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4 py-12">
        {error
          ? (
              <div className="w-full max-w-[480px]">
                <ErrorCard
                  error={error}
                  onRetry={handleRetry}
                  onReturnToForm={handleReturnToForm}
                />
              </div>
            )
          : (
              <div className="w-full max-w-[480px] rounded-xl border border-card-border bg-white p-8 shadow-card">
                {/* Spinning progress indicator */}
                <div className="mb-6 flex justify-center">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    className="animate-spin"
                    aria-label="Processing your assessment"
                  >
                    <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="5" />
                    <path
                      d="M 32 4 A 28 28 0 0 1 60 32"
                      stroke="#2563eb"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Heading */}
                <h1 className="mb-2 text-center text-xl font-semibold text-text-primary">
                  Preparing your personalised report...
                </h1>
                <p className="mb-8 text-center text-sm text-text-secondary">
                  Our AI is analysing your responses against investor readiness criteria.
                  {' '}
                  This usually takes 15–30 seconds.
                </p>

                {/* Step timeline */}
                <div className="relative mb-8">
                  {/* Connecting track line behind the circles */}
                  <div
                    className="absolute left-4 top-4 w-0.5 bg-card-border"
                    style={{ height: 'calc(100% - 2rem)' }}
                    aria-hidden="true"
                  />

                  <div className="space-y-6">
                    {STEPS.map((step, index) => (
                      <StepItem
                        key={step}
                        label={step}
                        status={getStepStatus(index, phase)}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-2 overflow-hidden rounded-full bg-card-border"
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-2 rounded-full bg-accent-blue transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

        {/* Footer */}
        <p className="mt-8 text-xs uppercase tracking-wider text-text-muted">
          Powered by E3 Digital
        </p>
      </main>
    </div>
  );
}
