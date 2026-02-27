export type AssessmentFormData = {
  // Section 1: Problem-Market Fit
  problemClarity: string;
  targetCustomer: string;
  marketSize: string;
  competitorAwareness: string;
  uniqueAdvantage: string;
  // Section 2: Product & Traction
  productStage: string;
  hasPayingCustomers: string;
  currentMRR: string;
  customerGrowthRate: string;
  evidenceOfDemand: string[];
  // Section 3: Business Model
  revenueModelClarity: string;
  primaryRevenueModel: string;
  unitEconomics: string;
  pricingConfidence: string;
  // Section 4: Team
  coFounderCount: string;
  teamCoverage: string;
  founderExperience: string;
  fullTimeTeamSize: string;
  // Section 5: Financials
  financialModel: string;
  monthlyBurnRate: string;
  runwayMonths: string;
  priorFunding: string;
  // Section 6: Go-to-Market
  gtmStrategy: string;
  acquisitionChannels: string[];
  cacKnowledge: string;
  salesRepeatability: string;
  // Section 7: Legal & IP
  companyIncorporation: string;
  ipProtection: string[];
  keyAgreements: string;
  // Section 8: Investment Readiness
  hasPitchDeck: string;
  fundingAskClarity: string;
  investmentStage: string;
  investorConversations: string;
  // Section 9: Metrics & Data
  trackingMetrics: string;
  metricsTracked: string[];
  canDemonstrateGrowth: string;
  // Section 10: Vision & Scalability
  visionScale: string;
  scalabilityStrategy: string;
  biggestRisks: string;
  // Section 11: Contact Info
  contactName: string;
  contactEmail: string;
  contactCompany: string;
  contactLinkedin: string;
  contactSource: string;
  consentChecked: boolean;
};
