/**
 * AI Scoring Calibration Script — Phase 8, Task 8.8
 *
 * Runs each of the 10 test profiles through the OpenRouter AI scorer three
 * times each and reports:
 *   - Individual scores per run
 *   - Mean score and standard deviation (consistency)
 *   - Predicted readiness level vs expected
 *   - PASS / FAIL verdict per profile
 *
 * Usage:
 *   dotenv -e .env.local -- npx tsx scripts/calibrate-ai.ts
 *
 * Required env vars:
 *   OPENROUTER_API_KEY  — your OpenRouter API key (from .env.local)
 *
 * Optional env vars:
 *   AI_MODEL            — overrides default model (anthropic/claude-sonnet-4)
 *   RUNS_PER_PROFILE    — number of runs per profile (default: 3)
 *   CALIBRATE_PROFILE   — run only this profile name (partial match, case-insensitive)
 */

import { z } from 'zod';

import type { AssessmentProfile } from '../tests/fixtures/assessment-profiles';
import { assessmentProfiles } from '../tests/fixtures/assessment-profiles';

// ── Config ────────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? 'anthropic/claude-sonnet-4';
const RUNS_PER_PROFILE = Number(process.env.RUNS_PER_PROFILE ?? '3');
const CALIBRATE_PROFILE = process.env.CALIBRATE_PROFILE?.toLowerCase();
// Free/auto-routing models have slightly more variance; bump MAX_STDDEV if needed
const MAX_STDDEV = Number(process.env.MAX_STDDEV ?? '6');

if (!OPENROUTER_API_KEY) {
  console.error('❌  OPENROUTER_API_KEY is not set. Run via:');
  console.error('    dotenv -e .env.local -- npx tsx scripts/calibrate-ai.ts');
  process.exit(1);
}

// ── Zod schema (mirrors src/lib/ai/scoring.ts) ───────────────────────────────

const CategorySchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  justification: z.string(),
  recommendation: z.string(),
});

const GapSchema = z.object({
  title: z.string(),
  currentState: z.string(),
  recommendedActions: z.array(z.string()),
});

const AIScoringResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  readinessLevel: z.enum(['investment_ready', 'nearly_there', 'early_stage', 'too_early']),
  categories: z.array(CategorySchema).length(10),
  // Free models sometimes return >3 gaps; truncate rather than fail validation
  topGaps: z.array(GapSchema).min(1).transform(gaps => gaps.slice(0, 3)),
  quickWins: z.array(z.string()).min(1).max(5),
  mediumTermRecommendations: z.array(z.string()).min(1).max(5),
});

type AIScoringResponse = z.infer<typeof AIScoringResponseSchema>;

// ── Prompt helpers ────────────────────────────────────────────────────────────

function formatResponses(responses: Record<string, string | string[] | boolean>): string {
  const lines: string[] = [];

  const field = (key: string): string => {
    const val = responses[key];
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return String(val ?? '(not provided)');
  };

  lines.push('SECTION 1: Problem-Market Fit');
  lines.push(`  Problem Clarity: ${field('problemClarity')}`);
  lines.push(`  Target Customer: ${field('targetCustomer')}`);
  lines.push(`  Market Size: ${field('marketSize')}`);
  lines.push(`  Competitor Awareness: ${field('competitorAwareness')}`);
  lines.push(`  Unique Advantage: ${field('uniqueAdvantage')}`);
  lines.push('\nSECTION 2: Product & Traction');
  lines.push(`  Product Stage: ${field('productStage')}`);
  lines.push(`  Has Paying Customers: ${field('hasPayingCustomers')}`);
  if (responses.currentMRR) {
    lines.push(`  Current MRR/ARR (£): ${field('currentMRR')}`);
  }
  if (responses.customerGrowthRate) {
    lines.push(`  Customer Growth Rate: ${field('customerGrowthRate')}`);
  }
  lines.push(`  Evidence of Demand: ${field('evidenceOfDemand')}`);
  lines.push('\nSECTION 3: Business Model');
  lines.push(`  Revenue Model Clarity: ${field('revenueModelClarity')}`);
  lines.push(`  Primary Revenue Model: ${field('primaryRevenueModel')}`);
  lines.push(`  Unit Economics Knowledge: ${field('unitEconomics')}`);
  lines.push(`  Pricing Confidence: ${field('pricingConfidence')}`);
  lines.push('\nSECTION 4: Team');
  lines.push(`  Co-founder Count: ${field('coFounderCount')}`);
  lines.push(`  Team Coverage (skills): ${field('teamCoverage')}`);
  lines.push(`  Founder Experience: ${field('founderExperience')}`);
  lines.push(`  Full-time Team Size: ${field('fullTimeTeamSize')}`);
  lines.push('\nSECTION 5: Financials');
  lines.push(`  Financial Model: ${field('financialModel')}`);
  lines.push(`  Monthly Burn Rate (£): ${field('monthlyBurnRate')}`);
  lines.push(`  Runway: ${field('runwayMonths')}`);
  lines.push(`  Prior Funding: ${field('priorFunding')}`);
  lines.push('\nSECTION 6: Go-to-Market');
  lines.push(`  GTM Strategy: ${field('gtmStrategy')}`);
  lines.push(`  Acquisition Channels: ${field('acquisitionChannels')}`);
  lines.push(`  CAC Knowledge: ${field('cacKnowledge')}`);
  lines.push(`  Sales Repeatability: ${field('salesRepeatability')}`);
  lines.push('\nSECTION 7: Legal & IP');
  lines.push(`  Company Incorporation: ${field('companyIncorporation')}`);
  lines.push(`  IP Protection: ${field('ipProtection')}`);
  lines.push(`  Key Agreements in Place: ${field('keyAgreements')}`);
  lines.push('\nSECTION 8: Investment Readiness');
  lines.push(`  Has Pitch Deck: ${field('hasPitchDeck')}`);
  lines.push(`  Funding Ask Clarity: ${field('fundingAskClarity')}`);
  lines.push(`  Target Investment Stage: ${field('investmentStage')}`);
  lines.push(`  Investor Conversations: ${field('investorConversations')}`);
  lines.push('\nSECTION 9: Metrics & Data');
  lines.push(`  Tracking Maturity: ${field('trackingMetrics')}`);
  lines.push(`  Metrics Tracked: ${field('metricsTracked')}`);
  lines.push(`  Can Demonstrate Growth: ${field('canDemonstrateGrowth')}`);
  lines.push('\nSECTION 10: Vision & Scalability');
  lines.push(`  Vision Scale: ${field('visionScale')}`);
  lines.push(`  Scalability Strategy: ${field('scalabilityStrategy')}`);
  lines.push(`  Biggest Risks: ${field('biggestRisks')}`);

  return lines.join('\n');
}

const SYSTEM_PROMPT = `You are an experienced startup investment analyst with deep expertise in B2B SaaS ventures. \
Your task is to evaluate a founder's investor readiness based on their self-assessment responses.

Score each of the following 10 categories from 0 to 100:
1. Problem-Market Fit — clarity of problem, target customer definition, market size, competitive differentiation
2. Product & Traction — product stage, customer validation, evidence of demand, growth indicators
3. Business Model — revenue model clarity, pricing confidence, unit economics understanding
4. Team — founder experience, team completeness, domain expertise, full-time commitment
5. Financials — financial model sophistication, burn rate awareness, runway, prior funding
6. Go-to-Market — GTM strategy clarity, acquisition channels, CAC awareness, sales repeatability
7. Legal & IP — incorporation status, IP protection, key agreements in place
8. Investment Readiness — pitch deck existence, funding ask clarity, investor engagement level
9. Metrics & Data — tracking maturity, key metrics coverage, ability to demonstrate growth
10. Vision & Scalability — scale of vision, scalability strategy, risk awareness

Readiness level thresholds (based on overall weighted score):
- investment_ready: 75–100
- nearly_there: 55–74
- early_stage: 30–54
- too_early: 0–29

IMPORTANT: Respond ONLY with a single valid JSON object. No markdown fences, no explanation, no preamble. \
The JSON must exactly match this structure:
{
  "overallScore": <0-100>,
  "readinessLevel": "<investment_ready|nearly_there|early_stage|too_early>",
  "categories": [
    { "name": "<category name>", "score": <0-100>, "justification": "<1-2 sentences>", "recommendation": "<specific action>" }
  ],
  "topGaps": [
    { "title": "<gap title>", "currentState": "<current weakness>", "recommendedActions": ["<action>"] }
  ],
  "quickWins": ["<actionable item doable this week>"],
  "mediumTermRecommendations": ["<1–3 month strategic recommendation>"]
}`;

// ── OpenRouter call ───────────────────────────────────────────────────────────

async function callOpenRouter(userContent: string): Promise<AIScoringResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://assess.e3digital.net',
      'X-Title': 'E3 Digital Investor Readiness - AI Calibration',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${text}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  const content = data.choices[0]?.message.content;
  if (!content) {
    throw new Error('OpenRouter returned empty content');
  }

  // Strip markdown fences if present
  let text = content.trim();
  if (text.startsWith('```')) {
    const firstNewline = text.indexOf('\n');
    if (firstNewline !== -1) {
      text = text.slice(firstNewline + 1);
    }
    const lastFence = text.lastIndexOf('```');
    if (lastFence !== -1) {
      text = text.slice(0, lastFence).trimEnd();
    }
  }

  let parsed = JSON.parse(text) as unknown;
  // Some free models wrap the response in an outer object e.g. { "assessment": { ... } }
  // Unwrap one level if the top-level object doesn't contain expected fields
  if (
    typeof parsed === 'object'
    && parsed !== null
    && !('overallScore' in parsed)
  ) {
    const candidate = Object.values(parsed as Record<string, unknown>).find(
      v => typeof v === 'object' && v !== null && 'overallScore' in (v as Record<string, unknown>),
    );
    if (candidate !== undefined) {
      parsed = candidate;
    }
  }

  const validated = AIScoringResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`AI response schema validation failed: ${JSON.stringify(validated.error.issues)}`);
  }
  return validated.data;
}

// ── Deterministic level computation (mirrors scoring.ts) ─────────────────────
// Always override the AI's readinessLevel with the computed value from overallScore.
function computeReadinessLevel(score: number): string {
  if (score >= 75) {
    return 'investment_ready';
  }
  if (score >= 55) {
    return 'nearly_there';
  }
  if (score >= 30) {
    return 'early_stage';
  }
  return 'too_early';
}

// ── Statistics helpers ────────────────────────────────────────────────────────

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// ── Per-profile result ────────────────────────────────────────────────────────

type RunResult = {
  score: number;
  readinessLevel: string;
  topGapTitles: string[];
};

type ProfileResult = {
  profile: AssessmentProfile;
  runs: RunResult[];
  meanScore: number;
  stdDevScore: number;
  mostCommonLevel: string;
  scoreInRange: boolean;
  levelMatches: boolean;
  consistencyPass: boolean; // stdDev <= MAX_STDDEV
  passed: boolean;
  error?: string;
};

// ── Main calibration loop ─────────────────────────────────────────────────────

async function calibrateProfile(profile: AssessmentProfile): Promise<ProfileResult> {
  const userContent = `Please evaluate the following founder assessment responses:\n\n${formatResponses(profile.responses)}`;
  const runs: RunResult[] = [];
  let firstError: string | undefined;

  for (let run = 1; run <= RUNS_PER_PROFILE; run++) {
    try {
      console.log(`  Run ${run}/${RUNS_PER_PROFILE}...`);
      const result = await callOpenRouter(userContent);
      runs.push({
        score: result.overallScore,
        readinessLevel: computeReadinessLevel(result.overallScore),
        topGapTitles: result.topGaps.map(g => g.title),
      });
      // Brief pause between runs to avoid rate limiting
      if (run < RUNS_PER_PROFILE) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ⚠️  Run ${run} failed: ${msg}`);
      if (!firstError) {
        firstError = msg;
      }
    }
  }

  if (runs.length === 0) {
    return {
      profile,
      runs: [],
      meanScore: 0,
      stdDevScore: 0,
      mostCommonLevel: 'unknown',
      scoreInRange: false,
      levelMatches: false,
      consistencyPass: false,
      passed: false,
      error: firstError,
    };
  }

  const scores = runs.map(r => r.score);
  const m = mean(scores);
  const sd = stdDev(scores);

  // Derive readiness level from mean score (mirrors production scoring.ts behaviour).
  // Using mean score avoids boundary flipping when individual run scores straddle a threshold.
  const mostCommonLevel = computeReadinessLevel(m);

  const [minExpected, maxExpected] = profile.expectedScoreRange;
  const scoreInRange = m >= minExpected && m <= maxExpected;
  const levelMatches = mostCommonLevel === profile.expectedReadinessLevel;
  const consistencyPass = sd <= MAX_STDDEV;

  return {
    profile,
    runs,
    meanScore: m,
    stdDevScore: sd,
    mostCommonLevel,
    scoreInRange,
    levelMatches,
    consistencyPass,
    passed: scoreInRange && levelMatches && consistencyPass,
    error: firstError,
  };
}

function printResult(result: ProfileResult): void {
  const { profile, runs, meanScore, stdDevScore, mostCommonLevel, scoreInRange, levelMatches, consistencyPass, passed, error } = result;
  const verdict = passed ? '✅ PASS' : '❌ FAIL';

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`${verdict}  ${profile.name}`);
  console.log(`  ${profile.description}`);

  if (runs.length > 0) {
    const scoreStr = runs.map(r => r.score).join(', ');
    console.log(`  Scores (${RUNS_PER_PROFILE} runs): [${scoreStr}]`);
    console.log(`  Mean: ${meanScore.toFixed(1)}  StdDev: ${stdDevScore.toFixed(1)}  (${consistencyPass ? '✓ consistent' : `✗ inconsistent — stdDev > ${MAX_STDDEV}`})`);
    console.log(`  Expected range: [${profile.expectedScoreRange[0]}–${profile.expectedScoreRange[1]}]  → ${scoreInRange ? '✓ in range' : '✗ out of range'}`);
    console.log(`  Readiness level: ${mostCommonLevel}  Expected: ${profile.expectedReadinessLevel}  → ${levelMatches ? '✓ matches' : '✗ mismatch'}`);

    const gaps = runs.flatMap(r => r.topGapTitles);
    const uniqueGaps = [...new Set(gaps)];
    console.log(`  Top gaps seen: ${uniqueGaps.join(' | ')}`);
  } else {
    console.log(`  ⚠️  All runs failed: ${error ?? 'unknown error'}`);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('═'.repeat(70));
  console.log('  E3 Digital — AI Scoring Calibration');
  console.log(`  Model: ${AI_MODEL}`);
  console.log(`  Runs per profile: ${RUNS_PER_PROFILE}`);
  if (CALIBRATE_PROFILE) {
    console.log(`  Filter: profiles matching "${CALIBRATE_PROFILE}"`);
  }
  console.log('═'.repeat(70));

  const profilesToRun = CALIBRATE_PROFILE
    ? assessmentProfiles.filter(p => p.name.toLowerCase().includes(CALIBRATE_PROFILE))
    : assessmentProfiles;

  if (profilesToRun.length === 0) {
    console.error(`No profiles match "${CALIBRATE_PROFILE ?? ''}"`);
    process.exit(1);
  }

  const results: ProfileResult[] = [];

  for (const profile of profilesToRun) {
    console.log(`\nRunning: ${profile.name}`);
    const result = await calibrateProfile(profile);
    printResult(result);
    results.push(result);

    // Pause between profiles to respect rate limits
    if (profilesToRun.indexOf(profile) < profilesToRun.length - 1) {
      console.log('  (waiting 3s before next profile...)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`\n${'═'.repeat(70)}`);
  console.log('  CALIBRATION SUMMARY');
  console.log('═'.repeat(70));
  console.log(`  Total profiles: ${total}`);
  console.log(`  Passed:         ${passed} / ${total}`);
  console.log(`  Failed:         ${total - passed} / ${total}`);

  const failedResults = results.filter(r => !r.passed);
  if (failedResults.length > 0) {
    console.log('\n  Failed profiles:');
    for (const r of failedResults) {
      const reasons: string[] = [];
      if (!r.scoreInRange) {
        reasons.push(`score ${r.meanScore.toFixed(1)} outside [${r.profile.expectedScoreRange[0]}–${r.profile.expectedScoreRange[1]}]`);
      }
      if (!r.levelMatches) {
        reasons.push(`level "${r.mostCommonLevel}" ≠ expected "${r.profile.expectedReadinessLevel}"`);
      }
      if (!r.consistencyPass) {
        reasons.push(`stdDev ${r.stdDevScore.toFixed(1)} > 5`);
      }
      console.log(`    ❌ ${r.profile.name}: ${reasons.join(', ')}`);
    }
    console.log('\n  → Review the AI prompt in src/lib/ai/scoring.ts or adjust expectedScoreRange in tests/fixtures/assessment-profiles.ts');
  } else {
    console.log('\n  ✅ All profiles passed. AI scoring is calibrated and consistent.');
  }

  const failCount = total - passed;
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
