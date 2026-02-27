import { z } from 'zod';

import type { AssessmentResponses } from '@/lib/validation/submission-schema';
import { Env } from '@/libs/Env';

// ── Zod schema for the expected AI response ──────────────────────────────────

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

export const AIScoringResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  readinessLevel: z.enum(['investment_ready', 'nearly_there', 'early_stage', 'too_early']),
  categories: z.array(CategorySchema).length(10),
  topGaps: z.array(GapSchema).min(1).max(3),
  quickWins: z.array(z.string()).min(1).max(5),
  mediumTermRecommendations: z.array(z.string()).min(1).max(5),
});

export type AIScoringResponse = z.infer<typeof AIScoringResponseSchema>;

// ── Prompt construction ───────────────────────────────────────────────────────

function formatResponses(data: AssessmentResponses): string {
  const lines: string[] = [];

  lines.push('SECTION 1: Problem-Market Fit');
  lines.push(`  Problem Clarity: ${data.problemClarity}`);
  lines.push(`  Target Customer: ${data.targetCustomer}`);
  lines.push(`  Market Size: ${data.marketSize}`);
  lines.push(`  Competitor Awareness: ${data.competitorAwareness}`);
  lines.push(`  Unique Advantage: ${data.uniqueAdvantage}`);

  lines.push('\nSECTION 2: Product & Traction');
  lines.push(`  Product Stage: ${data.productStage}`);
  lines.push(`  Has Paying Customers: ${data.hasPayingCustomers}`);
  if (data.currentMRR) {
    lines.push(`  Current MRR/ARR (£): ${data.currentMRR}`);
  }
  if (data.customerGrowthRate) {
    lines.push(`  Customer Growth Rate: ${data.customerGrowthRate}`);
  }
  lines.push(`  Evidence of Demand: ${data.evidenceOfDemand.join(', ')}`);

  lines.push('\nSECTION 3: Business Model');
  lines.push(`  Revenue Model Clarity: ${data.revenueModelClarity}`);
  lines.push(`  Primary Revenue Model: ${data.primaryRevenueModel}`);
  lines.push(`  Unit Economics Knowledge: ${data.unitEconomics}`);
  lines.push(`  Pricing Confidence: ${data.pricingConfidence}`);

  lines.push('\nSECTION 4: Team');
  lines.push(`  Co-founder Count: ${data.coFounderCount}`);
  lines.push(`  Team Coverage (skills): ${data.teamCoverage}`);
  lines.push(`  Founder Experience: ${data.founderExperience}`);
  lines.push(`  Full-time Team Size: ${data.fullTimeTeamSize}`);

  lines.push('\nSECTION 5: Financials');
  lines.push(`  Financial Model: ${data.financialModel}`);
  lines.push(`  Monthly Burn Rate (£): ${data.monthlyBurnRate}`);
  lines.push(`  Runway: ${data.runwayMonths}`);
  lines.push(`  Prior Funding: ${data.priorFunding}`);

  lines.push('\nSECTION 6: Go-to-Market');
  lines.push(`  GTM Strategy: ${data.gtmStrategy}`);
  lines.push(`  Acquisition Channels: ${data.acquisitionChannels.join(', ')}`);
  lines.push(`  CAC Knowledge: ${data.cacKnowledge}`);
  lines.push(`  Sales Repeatability: ${data.salesRepeatability}`);

  lines.push('\nSECTION 7: Legal & IP');
  lines.push(`  Company Incorporation: ${data.companyIncorporation}`);
  lines.push(`  IP Protection: ${data.ipProtection.join(', ')}`);
  lines.push(`  Key Agreements in Place: ${data.keyAgreements}`);

  lines.push('\nSECTION 8: Investment Readiness');
  lines.push(`  Has Pitch Deck: ${data.hasPitchDeck}`);
  lines.push(`  Funding Ask Clarity: ${data.fundingAskClarity}`);
  lines.push(`  Target Investment Stage: ${data.investmentStage}`);
  lines.push(`  Investor Conversations: ${data.investorConversations}`);

  lines.push('\nSECTION 9: Metrics & Data');
  lines.push(`  Tracking Maturity: ${data.trackingMetrics}`);
  lines.push(`  Metrics Tracked: ${data.metricsTracked.join(', ')}`);
  lines.push(`  Can Demonstrate Growth: ${data.canDemonstrateGrowth}`);

  lines.push('\nSECTION 10: Vision & Scalability');
  lines.push(`  Vision Scale: ${data.visionScale}`);
  lines.push(`  Scalability Strategy: ${data.scalabilityStrategy}`);
  lines.push(`  Biggest Risks: ${data.biggestRisks}`);

  return lines.join('\n');
}

function buildSystemPrompt(): string {
  return `You are an experienced startup investment analyst with deep expertise in B2B SaaS ventures. \
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

Scoring guide:
- 80–100: Excellent — investor-ready for this category
- 60–79: Good — minor gaps exist
- 40–59: Developing — notable gaps
- 20–39: Early stage — significant gaps
- 0–19: Pre-early — not investment-ready in this area

Readiness level thresholds (based on overall weighted score):
- investment_ready: 70–100
- nearly_there: 50–69
- early_stage: 25–49
- too_early: 0–24

IMPORTANT: Respond ONLY with a single valid JSON object. No markdown fences, no explanation, no preamble. \
The JSON must exactly match this structure:
{
  "overallScore": <0-100>,
  "readinessLevel": "<investment_ready|nearly_there|early_stage|too_early>",
  "categories": [
    { "name": "<category name>", "score": <0-100>, "justification": "<1-2 sentences>", "recommendation": "<specific action>" }
    // exactly 10 entries, one per category in order
  ],
  "topGaps": [
    { "title": "<gap title>", "currentState": "<current weakness>", "recommendedActions": ["<action>", "<action>"] }
    // 1–3 most critical gaps
  ],
  "quickWins": ["<actionable item doable this week>", ...],
  "mediumTermRecommendations": ["<1–3 month strategic recommendation>", ...]
}`;
}

// ── OpenRouter API call ───────────────────────────────────────────────────────

type OpenRouterMessage = {
  role: 'system' | 'user';
  content: string;
};

type OpenRouterRequest = {
  model: string;
  messages: OpenRouterMessage[];
  temperature: number;
  response_format: { type: 'json_object' };
};

type OpenRouterResponseBody = {
  choices: Array<{
    message: { content: string };
  }>;
};

const AI_MODEL = process.env.AI_MODEL ?? 'anthropic/claude-sonnet-4';
const TIMEOUT_MS = 30_000;

async function callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  const apiKey = Env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const body: OpenRouterRequest = {
    model: AI_MODEL,
    messages,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://assess.e3digital.net',
        'X-Title': 'E3 Digital Investor Readiness Assessment',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${text}`);
    }

    const data = await response.json() as OpenRouterResponseBody;
    const content = data.choices[0]?.message.content;
    if (!content) {
      throw new Error('OpenRouter returned empty content');
    }
    return content;
  } finally {
    clearTimeout(timer);
  }
}

// ── JSON parsing (handles markdown fences if model ignores response_format) ──

function parseJsonContent(content: string): unknown {
  let text = content.trim();
  // Strip markdown code fences (```json ... ``` or ``` ... ```) if present
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
  return JSON.parse(text);
}

// ── Public scoring function ───────────────────────────────────────────────────

/**
 * Score an assessment using OpenRouter AI.
 * Retries once with a correction prompt if the first response fails Zod validation.
 * Throws on second failure — caller should handle the fallback.
 */
export async function scoreAssessment(responses: AssessmentResponses): Promise<AIScoringResponse> {
  const systemPrompt = buildSystemPrompt();
  const userContent = `Please evaluate the following founder assessment responses:\n\n${formatResponses(responses)}`;

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  // First attempt
  const firstContent = await callOpenRouter(messages);

  let parsed: unknown;
  try {
    parsed = parseJsonContent(firstContent);
  } catch {
    parsed = null;
  }

  const firstResult = AIScoringResponseSchema.safeParse(parsed);
  if (firstResult.success) {
    return firstResult.data;
  }

  // Second attempt — send correction prompt with the invalid response
  const correctionMessages: OpenRouterMessage[] = [
    ...messages,
    { role: 'user', content: firstContent },
    {
      role: 'user',
      content:
        `Your previous response did not match the required JSON schema. \
Validation errors: ${JSON.stringify(firstResult.error.issues)}. \
Please respond ONLY with a corrected JSON object matching the exact schema specified in the system prompt.`,
    },
  ];

  const secondContent = await callOpenRouter(correctionMessages);

  let parsed2: unknown;
  try {
    parsed2 = parseJsonContent(secondContent);
  } catch {
    parsed2 = null;
  }

  const secondResult = AIScoringResponseSchema.safeParse(parsed2);
  if (secondResult.success) {
    return secondResult.data;
  }

  throw new Error(
    `AI response failed validation after retry: ${JSON.stringify(secondResult.error.issues)}`,
  );
}
