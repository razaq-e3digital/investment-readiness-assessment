import { z } from 'zod';

/**
 * Server-side Zod schema for the full assessment response payload.
 * Mirrors AssessmentFormData — re-validates on the server even after client validation.
 * Conditional fields (currentMRR, customerGrowthRate) are optional here;
 * client-side already enforced them when relevant.
 */
export const AssessmentResponsesSchema = z.object({
  // Section 1: Problem-Market Fit
  problemClarity: z.string().min(1),
  targetCustomer: z.string().min(1),
  marketSize: z.string().min(1),
  competitorAwareness: z.string().min(1),
  uniqueAdvantage: z.string().min(1),
  // Section 2: Product & Traction
  productStage: z.string().min(1),
  hasPayingCustomers: z.string().min(1),
  currentMRR: z.string().optional(),
  customerGrowthRate: z.string().optional(),
  evidenceOfDemand: z.array(z.string()).min(1),
  // Section 3: Business Model
  revenueModelClarity: z.string().min(1),
  primaryRevenueModel: z.string().min(1),
  unitEconomics: z.string().min(1),
  pricingConfidence: z.string().min(1),
  // Section 4: Team
  coFounderCount: z.string().min(1),
  teamCoverage: z.string().min(1),
  founderExperience: z.string().min(1),
  fullTimeTeamSize: z.string().min(1),
  // Section 5: Financials
  financialModel: z.string().min(1),
  monthlyBurnRate: z.string().min(1),
  runwayMonths: z.string().min(1),
  priorFunding: z.string().min(1),
  // Section 6: Go-to-Market
  gtmStrategy: z.string().min(1),
  acquisitionChannels: z.array(z.string()).min(1),
  cacKnowledge: z.string().min(1),
  salesRepeatability: z.string().min(1),
  // Section 7: Legal & IP
  companyIncorporation: z.string().min(1),
  ipProtection: z.array(z.string()).min(1),
  keyAgreements: z.string().min(1),
  // Section 8: Investment Readiness
  hasPitchDeck: z.string().min(1),
  fundingAskClarity: z.string().min(1),
  investmentStage: z.string().min(1),
  investorConversations: z.string().min(1),
  // Section 9: Metrics & Data
  trackingMetrics: z.string().min(1),
  metricsTracked: z.array(z.string()).min(1),
  canDemonstrateGrowth: z.string().min(1),
  // Section 10: Vision & Scalability
  visionScale: z.string().min(1),
  scalabilityStrategy: z.string().min(1),
  biggestRisks: z.string().min(1),
  // Section 11: Contact Info
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactCompany: z.string().optional(),
  contactLinkedin: z.string().optional(),
  contactSource: z.string().optional(),
  consentChecked: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required' }),
  }),
});

export const SubmissionBodySchema = z.object({
  responses: AssessmentResponsesSchema,
  recaptchaToken: z.string(),
});

export type SubmissionBody = z.infer<typeof SubmissionBodySchema>;
export type AssessmentResponses = z.infer<typeof AssessmentResponsesSchema>;
