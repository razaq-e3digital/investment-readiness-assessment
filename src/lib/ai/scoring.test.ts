import { AIScoringResponseSchema, scoreAssessment } from './scoring';

vi.mock('@/libs/Env', () => ({
  Env: { OPENROUTER_API_KEY: 'test-openrouter-key' },
}));

const validAIResponse = {
  overallScore: 72,
  readinessLevel: 'nearly_there',
  categories: Array.from({ length: 10 }, (_, i) => ({
    name: `Category ${i + 1}`,
    score: 70,
    justification: 'Good.',
    recommendation: 'Keep going.',
  })),
  topGaps: [{ title: 'Financial Model', currentState: 'Basic', recommendedActions: ['Build model'] }],
  quickWins: ['Fix pricing page'],
  mediumTermRecommendations: ['Hire sales lead'],
};

const validResponses = {
  problemClarity: 'Clear problem',
  targetCustomer: 'SMBs',
  marketSize: 'Large',
  competitorAwareness: 'High',
  uniqueAdvantage: 'Better UX',
  productStage: 'live',
  hasPayingCustomers: 'yes',
  evidenceOfDemand: ['paid customers', 'letters of intent'],
  revenueModelClarity: 'Clear',
  primaryRevenueModel: 'subscription',
  unitEconomics: 'understood',
  pricingConfidence: 'high',
  coFounderCount: '2',
  teamCoverage: 'full',
  founderExperience: 'experienced',
  fullTimeTeamSize: '3',
  financialModel: 'detailed',
  monthlyBurnRate: '5000',
  runwayMonths: '18',
  priorFunding: 'bootstrapped',
  gtmStrategy: 'outbound',
  acquisitionChannels: ['content marketing'],
  cacKnowledge: 'known',
  salesRepeatability: 'repeatable',
  companyIncorporation: 'ltd',
  ipProtection: ['trademark'],
  keyAgreements: 'signed',
  hasPitchDeck: 'yes',
  fundingAskClarity: 'clear',
  investmentStage: 'seed',
  investorConversations: 'active',
  trackingMetrics: 'advanced',
  metricsTracked: ['MRR', 'CAC'],
  canDemonstrateGrowth: 'yes',
  visionScale: 'global',
  scalabilityStrategy: 'SaaS model',
  biggestRisks: 'competition',
  contactName: 'Jane Doe',
  contactEmail: 'jane@example.com',
  consentChecked: true as const,
};

function makeSuccessResponse(content: string): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content } }] }),
    text: async () => content,
  } as unknown as Response;
}

function makeErrorResponse(status: number, body: string): Response {
  return {
    ok: false,
    status,
    text: async () => body,
    json: async () => ({}),
  } as unknown as Response;
}

describe('AIScoringResponseSchema', () => {
  it('accepts a valid AI response', () => {
    const result = AIScoringResponseSchema.safeParse(validAIResponse);

    expect(result.success).toBe(true);
  });

  it('rejects overallScore greater than 100', () => {
    const result = AIScoringResponseSchema.safeParse({
      ...validAIResponse,
      overallScore: 101,
    });

    expect(result.success).toBe(false);
  });

  it('rejects when categories array has fewer than 10 entries', () => {
    const result = AIScoringResponseSchema.safeParse({
      ...validAIResponse,
      categories: validAIResponse.categories.slice(0, 9),
    });

    expect(result.success).toBe(false);
  });

  it('rejects when categories array has more than 10 entries', () => {
    const extraCategory = { name: 'Extra', score: 50, justification: 'Extra.', recommendation: 'None.' };
    const result = AIScoringResponseSchema.safeParse({
      ...validAIResponse,
      categories: [...validAIResponse.categories, extraCategory],
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid readinessLevel value', () => {
    const result = AIScoringResponseSchema.safeParse({
      ...validAIResponse,
      readinessLevel: 'not_valid',
    });

    expect(result.success).toBe(false);
  });

  it('accepts all valid readinessLevel values', () => {
    const levels = ['investment_ready', 'nearly_there', 'early_stage', 'too_early'] as const;
    for (const level of levels) {
      const result = AIScoringResponseSchema.safeParse({
        ...validAIResponse,
        readinessLevel: level,
      });

      expect(result.success).toBe(true);
    }
  });

  it('rejects overallScore below 0', () => {
    const result = AIScoringResponseSchema.safeParse({
      ...validAIResponse,
      overallScore: -1,
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty topGaps array', () => {
    const result = AIScoringResponseSchema.safeParse({
      ...validAIResponse,
      topGaps: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty quickWins array', () => {
    const result = AIScoringResponseSchema.safeParse({
      ...validAIResponse,
      quickWins: [],
    });

    expect(result.success).toBe(false);
  });
});

describe('scoreAssessment', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed result on a successful first attempt', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      makeSuccessResponse(JSON.stringify(validAIResponse)),
    );

    const result = await scoreAssessment(validResponses);

    expect(result.overallScore).toBe(72);
    expect(result.readinessLevel).toBe('nearly_there');
    expect(result.categories).toHaveLength(10);
  });

  it('parses correctly when AI wraps JSON in markdown fences', async () => {
    const fenced = `\`\`\`json\n${JSON.stringify(validAIResponse)}\n\`\`\``;
    globalThis.fetch = vi.fn().mockResolvedValueOnce(makeSuccessResponse(fenced));

    const result = await scoreAssessment(validResponses);

    expect(result.overallScore).toBe(72);
  });

  it('parses correctly when AI uses plain markdown fences (no language tag)', async () => {
    const fenced = `\`\`\`\n${JSON.stringify(validAIResponse)}\n\`\`\``;
    globalThis.fetch = vi.fn().mockResolvedValueOnce(makeSuccessResponse(fenced));

    const result = await scoreAssessment(validResponses);

    expect(result.overallScore).toBe(72);
  });

  it('retries once when first response fails validation, succeeds on second', async () => {
    const badResponse = { overallScore: 50 }; // missing required fields
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(makeSuccessResponse(JSON.stringify(badResponse)))
      .mockResolvedValueOnce(makeSuccessResponse(JSON.stringify(validAIResponse)));
    globalThis.fetch = mockFetch;

    const result = await scoreAssessment(validResponses);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.overallScore).toBe(72);
  });

  it('throws when both attempts fail validation', async () => {
    const badResponse = { overallScore: 50 };
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(makeSuccessResponse(JSON.stringify(badResponse)))
      .mockResolvedValueOnce(makeSuccessResponse(JSON.stringify(badResponse)));

    await expect(scoreAssessment(validResponses)).rejects.toThrow(
      'AI response failed validation after retry',
    );
  });

  it('throws when first attempt returns invalid JSON and second also fails', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(makeSuccessResponse('not valid json at all'))
      .mockResolvedValueOnce(makeSuccessResponse('also not json'));

    await expect(scoreAssessment(validResponses)).rejects.toThrow(
      'AI response failed validation after retry',
    );
  });

  it('throws when OpenRouter returns a non-200 status code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      makeErrorResponse(500, 'Internal Server Error'),
    );

    await expect(scoreAssessment(validResponses)).rejects.toThrow('OpenRouter API error 500');
  });

  it('throws when OpenRouter returns a 429 rate limit error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      makeErrorResponse(429, 'Too Many Requests'),
    );

    await expect(scoreAssessment(validResponses)).rejects.toThrow('OpenRouter API error 429');
  });

  it('throws when API returns empty content', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '' } }] }),
      text: async () => '',
    } as unknown as Response);

    await expect(scoreAssessment(validResponses)).rejects.toThrow('OpenRouter returned empty content');
  });

  it('throws when choices array is empty', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [] }),
      text: async () => '',
    } as unknown as Response);

    await expect(scoreAssessment(validResponses)).rejects.toThrow('OpenRouter returned empty content');
  });
});
