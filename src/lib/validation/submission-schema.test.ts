import { AssessmentResponsesSchema, SubmissionBodySchema } from './submission-schema';

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

describe('AssessmentResponsesSchema', () => {
  it('accepts a fully valid responses object', () => {
    const result = AssessmentResponsesSchema.safeParse(validResponses);

    expect(result.success).toBe(true);
  });

  it('rejects when a required string field is empty', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      problemClarity: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email address', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      contactEmail: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty evidenceOfDemand array', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      evidenceOfDemand: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects when consentChecked is false', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      consentChecked: false,
    });

    expect(result.success).toBe(false);
  });

  it('accepts when consentChecked is true', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      consentChecked: true,
    });

    expect(result.success).toBe(true);
  });

  it('accepts when all optional fields are absent', () => {
    const { currentMRR: _mrr, customerGrowthRate: _cgr, contactCompany: _cc, contactLinkedin: _cl, contactSource: _cs, ...withoutOptionals } = {
      ...validResponses,
      currentMRR: 'some-mrr',
      customerGrowthRate: '10%',
      contactCompany: 'Acme',
      contactLinkedin: 'https://linkedin.com/in/jane',
      contactSource: 'twitter',
    };
    const result = AssessmentResponsesSchema.safeParse(withoutOptionals);

    expect(result.success).toBe(true);
  });

  it('accepts when optional fields are present', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      currentMRR: '5000',
      customerGrowthRate: '20%',
      contactCompany: 'Acme Corp',
      contactLinkedin: 'https://linkedin.com/in/jane',
      contactSource: 'conference',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty acquisitionChannels array', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      acquisitionChannels: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty ipProtection array', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      ipProtection: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty metricsTracked array', () => {
    const result = AssessmentResponsesSchema.safeParse({
      ...validResponses,
      metricsTracked: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects when contactName is missing', () => {
    const { contactName: _cn, ...withoutName } = validResponses;
    const result = AssessmentResponsesSchema.safeParse(withoutName);

    expect(result.success).toBe(false);
  });
});

describe('SubmissionBodySchema', () => {
  it('accepts a valid submission body with a recaptchaToken', () => {
    const result = SubmissionBodySchema.safeParse({
      responses: validResponses,
      recaptchaToken: 'some-recaptcha-token',
    });

    expect(result.success).toBe(true);
  });

  it('rejects when recaptchaToken is missing', () => {
    const result = SubmissionBodySchema.safeParse({
      responses: validResponses,
    });

    expect(result.success).toBe(false);
  });

  it('rejects when responses fail validation', () => {
    const result = SubmissionBodySchema.safeParse({
      responses: { ...validResponses, contactEmail: 'bad-email' },
      recaptchaToken: 'token',
    });

    expect(result.success).toBe(false);
  });
});
