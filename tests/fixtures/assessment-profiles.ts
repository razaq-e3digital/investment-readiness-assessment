/**
 * Assessment test profiles — 10 diverse founder archetypes.
 *
 * Each profile contains:
 * - name / description for human readability
 * - expectedReadinessLevel and expectedScoreRange for AI calibration assertions
 * - responses: a complete set of form field values matching AssessmentResponsesSchema
 *
 * Used by:
 * - Task 8.8 AI calibration script (scripts/calibrate-ai.ts)
 * - E2E smoke tests that submit real assessments to the API
 *
 * All required fields from AssessmentResponsesSchema are populated.
 * Optional fields (currentMRR, customerGrowthRate, contactCompany, contactLinkedin,
 * contactSource) are included where they make narrative sense.
 */

export type AssessmentProfile = {
  name: string;
  description: string;
  expectedReadinessLevel: 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early';
  /** [min, max] inclusive score range expected from the AI scorer */
  expectedScoreRange: [number, number];
  responses: Record<string, string | string[] | boolean>;
};

export const assessmentProfiles: AssessmentProfile[] = [
  // ── 1. Investment Ready ───────────────────────────────────────────────────
  {
    name: 'Investment Ready',
    description:
      'Strong across all 10 criteria: proven traction, experienced team, '
      + 'detailed financials, active investor pipeline, clear 3-year vision.',
    expectedReadinessLevel: 'investment_ready',
    expectedScoreRange: [78, 100],
    responses: {
      // Section 1: Problem-Market Fit
      problemClarity: 'very-clear',
      targetCustomer:
        'CFOs and finance directors at mid-market B2B SaaS companies (50–500 employees) '
        + 'who spend 3+ days per month on manual financial reporting.',
      marketSize: '1b-plus',
      competitorAwareness: 'deep',
      uniqueAdvantage:
        'The only finance automation platform with native ERP integrations and an '
        + 'AI reconciliation engine that reaches 98% accuracy without manual rules. '
        + 'Validated with 3 enterprise design partners over 12 months.',
      // Section 2: Product & Traction
      productStage: 'revenue',
      hasPayingCustomers: 'yes-recurring',
      currentMRR: '42000',
      customerGrowthRate: 'over-20',
      evidenceOfDemand: ['paying-customers', 'signed-lois', 'user-feedback'],
      // Section 3: Business Model
      revenueModelClarity: 'clear-validated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'positive-improving',
      pricingConfidence: 'very-confident',
      // Section 4: Team
      coFounderCount: 'two',
      teamCoverage: 'all-covered',
      founderExperience: 'yes-exit',
      fullTimeTeamSize: '8',
      // Section 5: Financials
      financialModel: 'detailed-3yr',
      monthlyBurnRate: '35000',
      runwayMonths: '12-plus',
      priorFunding: 'institutional',
      // Section 6: Go-to-Market
      gtmStrategy: 'detailed-executing',
      acquisitionChannels: ['content', 'sales', 'referrals', 'partnerships'],
      cacKnowledge: 'known-optimising',
      salesRepeatability: 'highly-repeatable',
      // Section 7: Legal & IP
      companyIncorporation: 'yes-ltd',
      ipProtection: ['patents', 'trade-secrets'],
      keyAgreements: 'all-in-place',
      // Section 8: Investment Readiness
      hasPitchDeck: 'investor-ready',
      fundingAskClarity: 'clear-ask',
      investmentStage: 'seed',
      investorConversations: 'active-discussions',
      // Section 9: Metrics & Data
      trackingMetrics: 'comprehensive',
      metricsTracked: ['mrr-arr', 'cac', 'ltv', 'churn', 'conversion', 'burn-rate'],
      canDemonstrateGrowth: 'clear-trends',
      // Section 10: Vision & Scalability
      visionScale: '100m-plus',
      scalabilityStrategy:
        'Expand from UK to US market in year 2 via a self-serve PLG motion. '
        + 'Platform is multi-tenant and infrastructure scales horizontally. '
        + 'Year 3: EU launch via channel partner agreements.',
      biggestRisks:
        'Enterprise sales cycles of 3–6 months slow ARR growth. Mitigation: '
        + 'self-serve SMB tier launched Q3. Competitive entry from legacy ERP vendors: '
        + 'moat via proprietary reconciliation data network effects.',
      // Section 11: Contact
      contactName: 'Sarah Chen',
      contactEmail: 'sarah@finflowsaas.com',
      contactCompany: 'FinFlow Ltd',
      contactLinkedin: 'https://linkedin.com/in/sarahchen',
      contactSource: 'referral',
      consentChecked: true,
    },
  },

  // ── 2. Nearly There ───────────────────────────────────────────────────────
  {
    name: 'Nearly There',
    description:
      'Strong product-market fit and traction, but financials need more detail '
      + 'and legal structure has some gaps.',
    expectedReadinessLevel: 'nearly_there',
    expectedScoreRange: [60, 78],
    responses: {
      problemClarity: 'very-clear',
      targetCustomer:
        'HR managers at growth-stage tech companies (100–1000 employees) who '
        + 'struggle to retain top engineers due to poor feedback systems.',
      marketSize: '100m-1b',
      competitorAwareness: 'general',
      uniqueAdvantage:
        'Continuous performance intelligence using Slack and GitHub signals — '
        + 'zero survey fatigue. First in our category to achieve 90-day payback.',
      productStage: 'revenue',
      hasPayingCustomers: 'yes-recurring',
      currentMRR: '18500',
      customerGrowthRate: '10-20',
      evidenceOfDemand: ['paying-customers', 'user-feedback'],
      revenueModelClarity: 'clear-validated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'positive-improving',
      pricingConfidence: 'somewhat-confident',
      coFounderCount: 'two',
      teamCoverage: 'most-covered',
      founderExperience: 'industry-exp',
      fullTimeTeamSize: '5',
      financialModel: 'basic-projections',
      monthlyBurnRate: '22000',
      runwayMonths: '6-12',
      priorFunding: 'friends-family',
      gtmStrategy: 'detailed-executing',
      acquisitionChannels: ['content', 'plg', 'referrals'],
      cacKnowledge: 'roughly-estimated',
      salesRepeatability: 'somewhat-repeatable',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['trade-secrets', 'copyright'],
      keyAgreements: 'most-in-place',
      hasPitchDeck: 'needs-work',
      fundingAskClarity: 'general-idea',
      investmentStage: 'seed',
      investorConversations: 'initial-meetings',
      trackingMetrics: 'basics',
      metricsTracked: ['mrr-arr', 'churn', 'mau'],
      canDemonstrateGrowth: 'clear-trends',
      visionScale: '100m-plus',
      scalabilityStrategy:
        'US expansion via inbound PLG in year 2. '
        + 'Platform is SaaS-native and scales without headcount.',
      biggestRisks:
        'Churn risk if product-market fit erodes in a downturn. Mitigation: '
        + 'expanded analytics and success team. Competitive risk: building '
        + 'proprietary data moat via benchmarks.',
      contactName: 'Marcus Taylor',
      contactEmail: 'marcus@peopleintel.io',
      contactCompany: 'PeopleIntel',
      contactSource: 'linkedin',
      consentChecked: true,
    },
  },

  // ── 3. Early Stage ────────────────────────────────────────────────────────
  {
    name: 'Early Stage',
    description:
      'Some product validation and a small paying customer base, but business '
      + 'model is still being refined and team has significant gaps.',
    expectedReadinessLevel: 'early_stage',
    expectedScoreRange: [40, 60],
    responses: {
      problemClarity: 'somewhat-clear',
      targetCustomer:
        'Small accountancy practices (2–10 staff) who spend too much time on '
        + 'manual client onboarding.',
      marketSize: '10m-100m',
      competitorAwareness: 'limited',
      uniqueAdvantage:
        'We automate the entire client onboarding workflow with pre-built HMRC '
        + 'compliance checks — saving 4 hours per new client.',
      productStage: 'live-users',
      hasPayingCustomers: 'yes-oneoff',
      currentMRR: '3200',
      customerGrowthRate: '5-10',
      evidenceOfDemand: ['paying-customers', 'user-feedback'],
      revenueModelClarity: 'exploring',
      primaryRevenueModel: 'saas',
      unitEconomics: 'negative-path',
      pricingConfidence: 'experimenting',
      coFounderCount: 'two',
      teamCoverage: 'significant-gaps',
      founderExperience: 'no-exp',
      fullTimeTeamSize: '2',
      financialModel: 'rough-estimates',
      monthlyBurnRate: '4000',
      runwayMonths: '6-12',
      priorFunding: 'bootstrapped',
      gtmStrategy: 'high-level',
      acquisitionChannels: ['social', 'referrals'],
      cacKnowledge: 'dont-know',
      salesRepeatability: 'ad-hoc',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['no-ip'],
      keyAgreements: 'some-gaps',
      hasPitchDeck: 'in-progress',
      fundingAskClarity: 'not-defined',
      investmentStage: 'pre-seed',
      investorConversations: 'not-yet',
      trackingMetrics: 'ad-hoc',
      metricsTracked: ['mau'],
      canDemonstrateGrowth: 'mixed',
      visionScale: '10m-100m',
      scalabilityStrategy:
        'Build a marketplace of accountancy integrations. '
        + 'Long-term: white-label platform for accountancy software vendors.',
      biggestRisks:
        'Cash runway under 6 months if we don\'t close new customers. '
        + 'Mitigation: accelerating outbound. Competitor risk: established tools '
        + 'adding onboarding features.',
      contactName: 'Priya Mehta',
      contactEmail: 'priya@onboardaccounts.co.uk',
      contactSource: 'google',
      consentChecked: true,
    },
  },

  // ── 4. Too Early ─────────────────────────────────────────────────────────
  {
    name: 'Too Early',
    description:
      'Idea stage with no product, no customers, solo founder, and no legal '
      + 'structure. Not investor-ready.',
    expectedReadinessLevel: 'too_early',
    expectedScoreRange: [0, 40],
    responses: {
      problemClarity: 'still-refining',
      targetCustomer:
        'Small businesses that want to track sustainability metrics but don\'t '
        + 'know where to start.',
      marketSize: 'not-estimated',
      competitorAwareness: 'not-looked',
      uniqueAdvantage:
        'I want to make sustainability reporting easy and affordable for '
        + 'businesses that can\'t afford consultants.',
      productStage: 'concept',
      hasPayingCustomers: 'no-users',
      evidenceOfDemand: ['none'],
      revenueModelClarity: 'not-defined',
      primaryRevenueModel: 'other',
      unitEconomics: 'not-calculated',
      pricingConfidence: 'not-set',
      coFounderCount: 'solo',
      teamCoverage: 'solo-all',
      founderExperience: 'no-exp',
      fullTimeTeamSize: '1',
      financialModel: 'no-model',
      monthlyBurnRate: '0',
      runwayMonths: 'self-funded',
      priorFunding: 'bootstrapped',
      gtmStrategy: 'none',
      acquisitionChannels: ['other'],
      cacKnowledge: 'dont-know',
      salesRepeatability: 'no-process',
      companyIncorporation: 'not-yet',
      ipProtection: ['no-ip'],
      keyAgreements: 'nothing',
      hasPitchDeck: 'no',
      fundingAskClarity: 'not-defined',
      investmentStage: 'not-sure',
      investorConversations: 'not-yet',
      trackingMetrics: 'not-tracking',
      metricsTracked: ['none'],
      canDemonstrateGrowth: 'no-data',
      visionScale: 'not-thought',
      scalabilityStrategy:
        'I haven\'t thought about this yet — just want to get started and see '
        + 'if there is a market.',
      biggestRisks:
        'I\'m not sure what the risks are. I suppose competitors and not '
        + 'finding customers.',
      contactName: 'Tom Bradley',
      contactEmail: 'tom.bradley@outlook.com',
      contactSource: 'other',
      consentChecked: true,
    },
  },

  // ── 5. Technical Founder ──────────────────────────────────────────────────
  {
    name: 'Technical Founder',
    description:
      'Exceptional product depth and technical moat. Weak on go-to-market '
      + 'strategy, financial modelling, and commercial team coverage.',
    expectedReadinessLevel: 'early_stage',
    expectedScoreRange: [38, 58],
    responses: {
      problemClarity: 'very-clear',
      targetCustomer:
        'DevOps teams at software companies with 20–200 engineers who spend '
        + 'over 30% of sprint time on infrastructure toil.',
      marketSize: '1b-plus',
      competitorAwareness: 'deep',
      uniqueAdvantage:
        'Our eBPF-based runtime observability engine provides zero-overhead '
        + 'profiling with 2ms latency. Filed provisional patent. No competitor '
        + 'achieves sub-5ms in production at scale.',
      productStage: 'live-users',
      hasPayingCustomers: 'no-free-users',
      evidenceOfDemand: ['waitlist', 'user-feedback', 'market-research'],
      revenueModelClarity: 'clear-unvalidated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'not-calculated',
      pricingConfidence: 'experimenting',
      coFounderCount: 'solo',
      teamCoverage: 'significant-gaps',
      founderExperience: 'industry-exp',
      fullTimeTeamSize: '1',
      financialModel: 'rough-estimates',
      monthlyBurnRate: '2000',
      runwayMonths: '12-plus',
      priorFunding: 'bootstrapped',
      gtmStrategy: 'high-level',
      acquisitionChannels: ['content', 'other'],
      cacKnowledge: 'dont-know',
      salesRepeatability: 'no-process',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['patents', 'trade-secrets'],
      keyAgreements: 'some-gaps',
      hasPitchDeck: 'in-progress',
      fundingAskClarity: 'general-idea',
      investmentStage: 'pre-seed',
      investorConversations: 'informal',
      trackingMetrics: 'ad-hoc',
      metricsTracked: ['mau'],
      canDemonstrateGrowth: 'too-early',
      visionScale: '100m-plus',
      scalabilityStrategy:
        'Open-source the core engine to build community adoption, then '
        + 'monetise with enterprise features and managed cloud offering.',
      biggestRisks:
        'Solo founder — need a commercial co-founder urgently. '
        + 'Large vendors (Datadog, Grafana) could replicate features '
        + 'with more resources.',
      contactName: 'Aleksei Volkov',
      contactEmail: 'aleksei@ebpfcloud.io',
      contactCompany: 'eBPF Cloud Ltd',
      contactLinkedin: 'https://linkedin.com/in/alekseivolkov',
      contactSource: 'twitter',
      consentChecked: true,
    },
  },

  // ── 6. Sales-Led ──────────────────────────────────────────────────────────
  {
    name: 'Sales-Led',
    description:
      'Strong GTM, good early revenue, and repeatable sales process. '
      + 'Product is maturing and legal/IP is not formalized.',
    expectedReadinessLevel: 'nearly_there',
    expectedScoreRange: [55, 72],
    responses: {
      problemClarity: 'very-clear',
      targetCustomer:
        'Commercial real estate agencies (5–50 brokers) who lose deals due to '
        + 'slow and manual proposal generation.',
      marketSize: '100m-1b',
      competitorAwareness: 'general',
      uniqueAdvantage:
        'Our proposal generator integrates with every major CRE data provider '
        + 'and produces branded proposals in 90 seconds instead of 3 hours.',
      productStage: 'revenue',
      hasPayingCustomers: 'yes-recurring',
      currentMRR: '9800',
      customerGrowthRate: '10-20',
      evidenceOfDemand: ['paying-customers', 'user-feedback'],
      revenueModelClarity: 'clear-validated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'break-even',
      pricingConfidence: 'very-confident',
      coFounderCount: 'two',
      teamCoverage: 'most-covered',
      founderExperience: 'yes-no-exit',
      fullTimeTeamSize: '4',
      financialModel: 'basic-projections',
      monthlyBurnRate: '12000',
      runwayMonths: '6-12',
      priorFunding: 'friends-family',
      gtmStrategy: 'detailed-executing',
      acquisitionChannels: ['sales', 'events', 'referrals', 'partnerships'],
      cacKnowledge: 'roughly-estimated',
      salesRepeatability: 'highly-repeatable',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['no-ip'],
      keyAgreements: 'some-gaps',
      hasPitchDeck: 'needs-work',
      fundingAskClarity: 'general-idea',
      investmentStage: 'seed',
      investorConversations: 'initial-meetings',
      trackingMetrics: 'basics',
      metricsTracked: ['mrr-arr', 'conversion', 'burn-rate'],
      canDemonstrateGrowth: 'clear-trends',
      visionScale: '100m-plus',
      scalabilityStrategy:
        'Expand to US CRE market via existing UK franchise relationships. '
        + 'Build marketplace of third-party data integrations to increase stickiness.',
      biggestRisks:
        'Product depth — competitors building similar features. Mitigation: '
        + 'accelerating integration roadmap and building data moat. '
        + 'Key person risk on sales — need to hire second AE.',
      contactName: 'Charlotte Davies',
      contactEmail: 'charlotte@proposalflow.co.uk',
      contactCompany: 'ProposalFlow Ltd',
      contactSource: 'e3-website',
      consentChecked: true,
    },
  },

  // ── 7. Serial Entrepreneur ────────────────────────────────────────────────
  {
    name: 'Serial Entrepreneur',
    description:
      'Highly experienced team with a prior exit. The market sizing is vague '
      + 'and the current product is MVP-stage. Strong on legal and financials.',
    expectedReadinessLevel: 'early_stage',
    expectedScoreRange: [45, 65],
    responses: {
      problemClarity: 'somewhat-clear',
      targetCustomer:
        'Supply chain managers at UK manufacturers who struggle with '
        + 'visibility into tier-2 and tier-3 supplier risk.',
      marketSize: 'not-estimated',
      competitorAwareness: 'general',
      uniqueAdvantage:
        'Our founding team exited a logistics SaaS for £22M in 2021. We have '
        + 'deep domain relationships that give us unfair access to enterprise '
        + 'pilot programmes.',
      productStage: 'mvp',
      hasPayingCustomers: 'no-free-users',
      evidenceOfDemand: ['signed-lois', 'user-feedback'],
      revenueModelClarity: 'clear-unvalidated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'not-calculated',
      pricingConfidence: 'somewhat-confident',
      coFounderCount: 'three-plus',
      teamCoverage: 'all-covered',
      founderExperience: 'yes-exit',
      fullTimeTeamSize: '5',
      financialModel: 'detailed-3yr',
      monthlyBurnRate: '28000',
      runwayMonths: '12-plus',
      priorFunding: 'institutional',
      gtmStrategy: 'planned',
      acquisitionChannels: ['partnerships', 'events', 'sales'],
      cacKnowledge: 'roughly-estimated',
      salesRepeatability: 'ad-hoc',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['trade-secrets'],
      keyAgreements: 'all-in-place',
      hasPitchDeck: 'investor-ready',
      fundingAskClarity: 'clear-ask',
      investmentStage: 'seed',
      investorConversations: 'initial-meetings',
      trackingMetrics: 'basics',
      metricsTracked: ['burn-rate', 'mau'],
      canDemonstrateGrowth: 'too-early',
      visionScale: '100m-plus',
      scalabilityStrategy:
        'Platform play: aggregate supply chain intelligence across sectors. '
        + 'License data to risk insurers and commodity traders in phase 2.',
      biggestRisks:
        'Enterprise sales cycle — piloting with 3 design partners to de-risk. '
        + 'Market timing: post-COVID supply chain anxiety may normalise. '
        + 'Mitigation: positioning as cost-saving, not crisis response.',
      contactName: 'James Okafor',
      contactEmail: 'james@suppliergraph.com',
      contactCompany: 'SupplierGraph Ltd',
      contactLinkedin: 'https://linkedin.com/in/jamesokafor',
      contactSource: 'referral',
      consentChecked: true,
    },
  },

  // ── 8. Post-Seed ──────────────────────────────────────────────────────────
  {
    name: 'Post-Seed',
    description:
      'Has raised a seed round and is scaling, but growth metrics are unclear '
      + 'and the team has some functional gaps at leadership level.',
    expectedReadinessLevel: 'nearly_there',
    expectedScoreRange: [58, 75],
    responses: {
      problemClarity: 'very-clear',
      targetCustomer:
        'Operations leaders at Series A–B SaaS companies (50–300 employees) '
        + 'who need real-time headcount cost modelling integrated with their HRIS.',
      marketSize: '1b-plus',
      competitorAwareness: 'deep',
      uniqueAdvantage:
        'The only headcount planning tool that syncs live with Workday, BambooHR, '
        + 'and Rippling — eliminating the 2-day lag in board reporting.',
      productStage: 'revenue',
      hasPayingCustomers: 'yes-recurring',
      currentMRR: '58000',
      customerGrowthRate: '5-10',
      evidenceOfDemand: ['paying-customers', 'user-feedback', 'market-research'],
      revenueModelClarity: 'clear-validated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'negative-path',
      pricingConfidence: 'somewhat-confident',
      coFounderCount: 'two',
      teamCoverage: 'most-covered',
      founderExperience: 'industry-exp',
      fullTimeTeamSize: '14',
      financialModel: 'basic-projections',
      monthlyBurnRate: '85000',
      runwayMonths: '12-plus',
      priorFunding: 'institutional',
      gtmStrategy: 'detailed-executing',
      acquisitionChannels: ['content', 'paid-ads', 'sales', 'partnerships'],
      cacKnowledge: 'roughly-estimated',
      salesRepeatability: 'somewhat-repeatable',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['trade-secrets', 'copyright'],
      keyAgreements: 'all-in-place',
      hasPitchDeck: 'investor-ready',
      fundingAskClarity: 'general-idea',
      investmentStage: 'series-a',
      investorConversations: 'initial-meetings',
      trackingMetrics: 'basics',
      metricsTracked: ['mrr-arr', 'churn', 'burn-rate', 'cac'],
      canDemonstrateGrowth: 'mixed',
      visionScale: '100m-plus',
      scalabilityStrategy:
        'Series A to fund US GTM (field sales + marketing). Platform architecture '
        + 'already multi-tenant and SOC 2 certified. Target £5M ARR by month 24.',
      biggestRisks:
        'Burn rate with 14-month runway: Series A must close in Q2. '
        + 'Mitigation: two term sheets in negotiation. '
        + 'Churn risk: investing in customer success team (2 new hires Q1).',
      contactName: 'Amara Osei',
      contactEmail: 'amara@headcountiq.com',
      contactCompany: 'HeadcountIQ',
      contactLinkedin: 'https://linkedin.com/in/amaraosei',
      contactSource: 'linkedin',
      consentChecked: true,
    },
  },

  // ── 9. B2B SaaS Validated (Pre-Revenue) ──────────────────────────────────
  {
    name: 'B2B SaaS Validated',
    description:
      'Clear ICP with signed LOIs and design partners, strong metrics discipline '
      + 'and legal structure — but no revenue yet. Targeting pre-seed.',
    expectedReadinessLevel: 'early_stage',
    expectedScoreRange: [42, 62],
    responses: {
      problemClarity: 'very-clear',
      targetCustomer:
        'Revenue operations managers at B2B SaaS companies (20–150 AEs) who '
        + 'lose 15% of pipeline to poor lead routing and slow response times.',
      marketSize: '1b-plus',
      competitorAwareness: 'deep',
      uniqueAdvantage:
        '5ms lead routing decisions using real-time intent data and CRM signals. '
        + '3 signed LOIs from Series B companies committing to paid pilots on GA launch.',
      productStage: 'prototype',
      hasPayingCustomers: 'no-users',
      evidenceOfDemand: ['signed-lois', 'waitlist', 'user-feedback'],
      revenueModelClarity: 'clear-unvalidated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'not-calculated',
      pricingConfidence: 'somewhat-confident',
      coFounderCount: 'two',
      teamCoverage: 'all-covered',
      founderExperience: 'industry-exp',
      fullTimeTeamSize: '3',
      financialModel: 'basic-projections',
      monthlyBurnRate: '9500',
      runwayMonths: '12-plus',
      priorFunding: 'bootstrapped',
      gtmStrategy: 'planned',
      acquisitionChannels: ['content', 'sales', 'referrals'],
      cacKnowledge: 'roughly-estimated',
      salesRepeatability: 'ad-hoc',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['trade-secrets'],
      keyAgreements: 'all-in-place',
      hasPitchDeck: 'needs-work',
      fundingAskClarity: 'general-idea',
      investmentStage: 'pre-seed',
      investorConversations: 'informal',
      trackingMetrics: 'comprehensive',
      metricsTracked: ['mau', 'conversion', 'cac'],
      canDemonstrateGrowth: 'too-early',
      visionScale: '100m-plus',
      scalabilityStrategy:
        'Land in RevOps teams, expand into full GTM orchestration platform. '
        + 'SaaS model scales without linear COGS growth.',
      biggestRisks:
        'Pre-revenue risk: LOIs may not convert. Mitigation: structured paid '
        + 'pilot agreements with milestone payments. Timeline risk: MVP GA '
        + 'delayed by 6 weeks — engineering capacity resolved by new hire.',
      contactName: 'Natasha Williams',
      contactEmail: 'natasha@routewave.io',
      contactCompany: 'RouteWave Ltd',
      contactSource: 'event',
      consentChecked: true,
    },
  },

  // ── 10. Lifestyle Business Risk ───────────────────────────────────────────
  {
    name: 'Lifestyle Business Risk',
    description:
      'Profitable and operationally stable, but small market vision, low '
      + 'scalability ambition, and the metrics suggest this is lifestyle not VC. '
      + 'Investor readiness is low despite financial health.',
    expectedReadinessLevel: 'too_early',
    expectedScoreRange: [15, 40],
    responses: {
      problemClarity: 'somewhat-clear',
      targetCustomer:
        'Local yoga studio owners in the UK who need a simple booking and '
        + 'payment system.',
      marketSize: 'under-10m',
      competitorAwareness: 'limited',
      uniqueAdvantage:
        'We focus exclusively on yoga and wellness — the UI is much simpler '
        + 'than Mindbody and pricing is transparent.',
      productStage: 'revenue',
      hasPayingCustomers: 'yes-recurring',
      currentMRR: '4200',
      customerGrowthRate: 'under-5',
      evidenceOfDemand: ['paying-customers'],
      revenueModelClarity: 'clear-validated',
      primaryRevenueModel: 'saas',
      unitEconomics: 'positive-improving',
      pricingConfidence: 'very-confident',
      coFounderCount: 'solo',
      teamCoverage: 'solo-all',
      founderExperience: 'no-exp',
      fullTimeTeamSize: '1',
      financialModel: 'rough-estimates',
      monthlyBurnRate: '1200',
      runwayMonths: 'self-funded',
      priorFunding: 'bootstrapped',
      gtmStrategy: 'high-level',
      acquisitionChannels: ['social', 'referrals'],
      cacKnowledge: 'dont-know',
      salesRepeatability: 'somewhat-repeatable',
      companyIncorporation: 'yes-ltd',
      ipProtection: ['no-ip'],
      keyAgreements: 'some-gaps',
      hasPitchDeck: 'no',
      fundingAskClarity: 'not-defined',
      investmentStage: 'not-sure',
      investorConversations: 'not-yet',
      trackingMetrics: 'ad-hoc',
      metricsTracked: ['mrr-arr'],
      canDemonstrateGrowth: 'mixed',
      visionScale: 'lifestyle',
      scalabilityStrategy:
        'I\'d like to reach 500 studios across the UK and then see where '
        + 'it goes. I\'m not necessarily looking to become a huge company.',
      biggestRisks:
        'Larger competitors with more features. I try to keep my overheads '
        + 'low so I can compete on price. Churn is a risk but I offer annual '
        + 'plans to lock in customers.',
      contactName: 'Daniel Price',
      contactEmail: 'daniel@yogabooker.co.uk',
      contactCompany: 'YogaBooker',
      contactSource: 'google',
      consentChecked: true,
    },
  },
];
