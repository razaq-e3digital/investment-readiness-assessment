import { z } from 'zod';

const requiredString = z.string().min(1, 'Please answer this question');
const requiredTextarea = z
  .string()
  .min(10, 'Please provide at least 10 characters')
  .max(500, 'Maximum 500 characters');
const requiredMultiselect = z.array(z.string()).min(1, 'Please select at least one option');

export const section1Schema = z.object({
  problemClarity: requiredString,
  targetCustomer: requiredTextarea,
  marketSize: requiredString,
  competitorAwareness: requiredString,
  uniqueAdvantage: requiredTextarea,
});

export const section2Schema = z.object({
  productStage: requiredString,
  hasPayingCustomers: requiredString,
  evidenceOfDemand: requiredMultiselect,
});

export function getSection2Schema(hasPayingCustomers: string) {
  if (hasPayingCustomers === 'yes-recurring' || hasPayingCustomers === 'yes-oneoff') {
    return section2Schema.extend({
      currentMRR: z
        .string()
        .min(1, 'Please enter your MRR/ARR')
        .regex(/^\d+$/, 'Please enter a valid number'),
      customerGrowthRate: requiredString,
    });
  }
  return section2Schema;
}

export const section3Schema = z.object({
  revenueModelClarity: requiredString,
  primaryRevenueModel: requiredString,
  unitEconomics: requiredString,
  pricingConfidence: requiredString,
});

export const section4Schema = z.object({
  coFounderCount: requiredString,
  teamCoverage: requiredString,
  founderExperience: requiredString,
  fullTimeTeamSize: z
    .string()
    .min(1, 'Please enter the team size')
    .regex(/^\d+$/, 'Please enter a valid number'),
});

export const section5Schema = z.object({
  financialModel: requiredString,
  monthlyBurnRate: z
    .string()
    .min(1, 'Please enter your monthly burn rate')
    .regex(/^\d+$/, 'Please enter a valid number'),
  runwayMonths: requiredString,
  priorFunding: requiredString,
});

export const section6Schema = z.object({
  gtmStrategy: requiredString,
  acquisitionChannels: requiredMultiselect,
  cacKnowledge: requiredString,
  salesRepeatability: requiredString,
});

export const section7Schema = z.object({
  companyIncorporation: requiredString,
  ipProtection: requiredMultiselect,
  keyAgreements: requiredString,
});

export const section8Schema = z.object({
  hasPitchDeck: requiredString,
  fundingAskClarity: requiredString,
  investmentStage: requiredString,
  investorConversations: requiredString,
});

export const section9Schema = z.object({
  trackingMetrics: requiredString,
  metricsTracked: requiredMultiselect,
  canDemonstrateGrowth: requiredString,
});

export const section10Schema = z.object({
  visionScale: requiredString,
  scalabilityStrategy: requiredTextarea,
  biggestRisks: requiredTextarea,
});

export const section11Schema = z.object({
  contactName: z.string().min(1, 'This field is required'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactCompany: z.string().optional(),
  contactLinkedin: z
    .string()
    .optional()
    .refine(
      val => !val || val === '' || (val.startsWith('http') && val.includes('linkedin.com')),
      'Please enter a valid LinkedIn URL',
    ),
  contactSource: z.string().optional(),
  consentChecked: z.boolean().refine(val => val === true, 'You must accept to continue'),
});

export type SectionValidator = (
  values: Record<string, unknown>,
) => Promise<{ success: boolean; errors: Record<string, string> }>;

function makeValidator(schema: z.ZodTypeAny): SectionValidator {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { success: true, errors: {} };
    }
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path[0];
      if (typeof path === 'string' && !errors[path]) {
        errors[path] = issue.message;
      }
    }
    return { success: false, errors };
  };
}

export const sectionValidators: SectionValidator[] = [
  // Section 1
  makeValidator(section1Schema),
  // Section 2 — conditional
  async (values) => {
    const hasPayingCustomers = typeof values.hasPayingCustomers === 'string'
      ? values.hasPayingCustomers
      : '';
    const schema = getSection2Schema(hasPayingCustomers);
    const result = schema.safeParse(values);
    if (result.success) {
      return { success: true, errors: {} };
    }
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path[0];
      if (typeof path === 'string' && !errors[path]) {
        errors[path] = issue.message;
      }
    }
    return { success: false, errors };
  },
  // Section 3
  makeValidator(section3Schema),
  // Section 4
  makeValidator(section4Schema),
  // Section 5
  makeValidator(section5Schema),
  // Section 6
  makeValidator(section6Schema),
  // Section 7
  makeValidator(section7Schema),
  // Section 8
  makeValidator(section8Schema),
  // Section 9
  makeValidator(section9Schema),
  // Section 10
  makeValidator(section10Schema),
  // Section 11
  makeValidator(section11Schema),
];
