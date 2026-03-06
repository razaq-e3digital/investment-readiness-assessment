/**
 * Seed data for E2E tests.
 *
 * This module exports a pre-scored assessment record that can be inserted into
 * the test database before running results-page E2E tests.
 *
 * Usage (npm script — see package.json):
 *   npm run db:seed:test     # inserts seedAssessment into the DB
 *   npm run db:unseed:test   # removes the seed row by ID
 *
 * The seed record uses deterministic UUIDs (v4 format) so tests can reference
 * them by constant rather than querying the database.
 *
 * To insert this record in a migration/script, use Drizzle:
 *
 *   import { db } from '@/libs/DB';
 *   import { assessments } from '@/models/Schema';
 *   await db.insert(assessments).values(seedAssessment).onConflictDoNothing();
 */

// ---------------------------------------------------------------------------
// Types (mirroring the Drizzle schema shape without importing from src/)
// ---------------------------------------------------------------------------

type GapItem = {
  title: string;
  currentState: string;
  recommendedActions: string[];
};

type SeedAssessment = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactCompany: string;
  overallScore: number;
  readinessLevel: 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early';
  aiScored: boolean;
  categoryScores: Record<string, number>;
  topGaps: GapItem[];
  quickWins: string[];
  mediumTermRecommendations: string[];
};

// ---------------------------------------------------------------------------
// Primary seed record — "Nearly There" archetype, score 68
// ---------------------------------------------------------------------------

export const seedAssessment: SeedAssessment = {
  id: '11111111-1111-4111-a111-111111111111',
  contactName: 'Test Founder',
  contactEmail: 'test@example.com',
  contactCompany: 'TestCo Ltd',
  overallScore: 68,
  readinessLevel: 'nearly_there',
  aiScored: true,
  categoryScores: {
    'Problem-Market Fit': 75,
    'Product & Traction': 72,
    'Business Model': 65,
    'Team': 80,
    'Financials': 55,
    'Go-to-Market': 60,
    'Legal & IP': 70,
    'Investment Readiness': 65,
    'Metrics & Data': 58,
    'Vision & Scalability': 72,
  },
  topGaps: [
    {
      title: 'Financial Model',
      currentState: 'Basic spreadsheet only — no 3-year model or unit economics breakdown.',
      recommendedActions: [
        'Build a 3-year financial model with P&L, cash flow, and balance sheet.',
        'Define LTV and CAC per acquisition channel.',
        'Model two scenarios: base case and upside case for investor conversations.',
      ],
    },
    {
      title: 'Metrics Tracking',
      currentState: 'Tracking revenue and MAU only — no churn, LTV, or CAC data.',
      recommendedActions: [
        'Instrument your product for churn rate tracking (monthly cohort analysis).',
        'Calculate blended CAC per channel using actual spend data.',
        'Set up a weekly metrics dashboard accessible to the full founding team.',
      ],
    },
    {
      title: 'Go-to-Market Strategy',
      currentState:
        'Sales process is ad hoc — no documented playbook or repeatable pipeline.',
      recommendedActions: [
        'Document your ideal customer profile (ICP) with firmographic and behavioural attributes.',
        'Create a sales playbook covering qualification, discovery, demo, and close stages.',
        'Define 2–3 primary acquisition channels and set quarterly CAC targets for each.',
      ],
    },
  ],
  quickWins: [
    'Update LinkedIn company page with current product description and traction metrics.',
    'Create a one-pager (not a deck) for informal investor outreach.',
    'Set up a free Chartmogul or Baremetrics account to automate MRR tracking.',
    'Schedule a 1-hour session with a CFO advisor to review burn rate assumptions.',
  ],
  mediumTermRecommendations: [
    'Hire a fractional CFO or finance advisor to build the 3-year model before Series A process.',
    'Complete a formal competitive analysis and update your unique positioning statement.',
    'Formalise IP assignment agreements for all contractors and early employees.',
    'Run a pricing experiment with 3 new customers to validate willingness to pay at higher tiers.',
  ],
};

// ---------------------------------------------------------------------------
// Secondary seed record — "Investment Ready" archetype, score 85
// ---------------------------------------------------------------------------

export const seedAssessmentInvestmentReady: SeedAssessment = {
  id: '22222222-2222-4222-b222-222222222222',
  contactName: 'Investor Ready Founder',
  contactEmail: 'investor-ready@example.com',
  contactCompany: 'StarUpCo Ltd',
  overallScore: 85,
  readinessLevel: 'investment_ready',
  aiScored: true,
  categoryScores: {
    'Problem-Market Fit': 90,
    'Product & Traction': 88,
    'Business Model': 82,
    'Team': 92,
    'Financials': 85,
    'Go-to-Market': 80,
    'Legal & IP': 88,
    'Investment Readiness': 87,
    'Metrics & Data': 83,
    'Vision & Scalability': 88,
  },
  topGaps: [
    {
      title: 'Go-to-Market Repeatability',
      currentState: 'Sales process is somewhat repeatable but not yet fully documented.',
      recommendedActions: [
        'Document the full sales playbook and train the next AE hire against it.',
        'Track and optimise win rate and average sales cycle length.',
      ],
    },
  ],
  quickWins: [
    'Publish 2 case studies from existing customers to support outbound.',
    'Create a data room with financial model, cap table, and reference customers.',
  ],
  mediumTermRecommendations: [
    'Run a structured Series A process with a narrowed list of 15–20 target investors.',
    'Obtain SOC 2 Type II certification before enterprise pipeline scales.',
  ],
};

// ---------------------------------------------------------------------------
// Tertiary seed record — "Too Early" archetype, score 22
// ---------------------------------------------------------------------------

export const seedAssessmentTooEarly: SeedAssessment = {
  id: '33333333-3333-4333-a333-333333333333',
  contactName: 'Early Stage Founder',
  contactEmail: 'too-early@example.com',
  contactCompany: undefined as unknown as string,
  overallScore: 22,
  readinessLevel: 'too_early',
  aiScored: true,
  categoryScores: {
    'Problem-Market Fit': 30,
    'Product & Traction': 15,
    'Business Model': 10,
    'Team': 25,
    'Financials': 20,
    'Go-to-Market': 10,
    'Legal & IP': 30,
    'Investment Readiness': 10,
    'Metrics & Data': 15,
    'Vision & Scalability': 35,
  },
  topGaps: [
    {
      title: 'No Product or Customers',
      currentState: 'Concept only — no MVP, no users, no revenue.',
      recommendedActions: [
        'Build a landing page and waitlist to validate demand before writing code.',
        'Conduct 20 problem-discovery interviews with potential customers.',
        'Define a single use case and build a paper prototype for feedback.',
      ],
    },
    {
      title: 'Business Model Not Defined',
      currentState: 'No pricing model or revenue model has been established.',
      recommendedActions: [
        'Research comparable SaaS pricing pages in your vertical.',
        'Decide on pricing model (per seat, usage, flat rate) and test with early conversations.',
      ],
    },
    {
      title: 'Legal Structure Missing',
      currentState: 'No incorporated entity or legal agreements.',
      recommendedActions: [
        'Incorporate a Ltd company via Companies House (costs £12, takes 24 hours online).',
        'Sign IP assignment agreements with any technical collaborators now.',
      ],
    },
  ],
  quickWins: [
    'Incorporate the company today — it costs £12 and takes 24 hours online.',
    'Create a simple landing page with a waitlist sign-up to start measuring interest.',
    'Join a local startup community or accelerator programme for peer support.',
  ],
  mediumTermRecommendations: [
    'Complete 50 customer discovery interviews before committing to a product direction.',
    'Apply to a pre-seed incubator (e.g. Entrepreneur First, Y Combinator) for structure and capital.',
    'Find a technical co-founder if the founding team lacks engineering capability.',
  ],
};

// ---------------------------------------------------------------------------
// Pending (not yet AI scored) seed record
// ---------------------------------------------------------------------------

export type PendingAssessment = {
  id: string;
  contactName: string;
  contactEmail: string;
  aiScored: boolean;
};

export const seedAssessmentPending: PendingAssessment = {
  id: '44444444-4444-4444-b444-444444444444',
  contactName: 'Pending Review Founder',
  contactEmail: 'pending@example.com',
  aiScored: false,
};

// ---------------------------------------------------------------------------
// Exported collection for convenience
// ---------------------------------------------------------------------------

export const allSeedAssessments = [
  seedAssessment,
  seedAssessmentInvestmentReady,
  seedAssessmentTooEarly,
] as const;
