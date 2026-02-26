import type { AssessmentFormData } from '@/types/assessment';

type OptionItem = {
  value: string;
  title: string;
  description?: string;
};

type DropdownOption = {
  value: string;
  label: string;
};

type ConditionalRule = {
  fieldName: keyof AssessmentFormData;
  values: string[];
};

type BaseQuestion = {
  fieldName: keyof AssessmentFormData;
  label: string;
  helpText?: string;
  required?: boolean;
  conditional?: ConditionalRule;
};

type TextQuestion = BaseQuestion & {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
};

type TextareaQuestion = BaseQuestion & {
  type: 'textarea';
  placeholder?: string;
  maxLength?: number;
};

type EmailQuestion = BaseQuestion & {
  type: 'email';
  placeholder?: string;
};

type NumberQuestion = BaseQuestion & {
  type: 'number';
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
};

type RadioQuestion = BaseQuestion & {
  type: 'radio';
  options: OptionItem[];
};

type MultiselectQuestion = BaseQuestion & {
  type: 'multiselect';
  options: OptionItem[];
};

type DropdownQuestion = BaseQuestion & {
  type: 'dropdown';
  placeholder?: string;
  options: DropdownOption[];
};

type CheckboxQuestion = BaseQuestion & {
  type: 'checkbox';
  checkboxLabel: string;
};

export type QuestionDef =
  | TextQuestion
  | TextareaQuestion
  | EmailQuestion
  | NumberQuestion
  | RadioQuestion
  | MultiselectQuestion
  | DropdownQuestion
  | CheckboxQuestion;

export type SectionDef = {
  id: number;
  title: string;
  questions: QuestionDef[];
};

export type { DropdownOption, OptionItem };

export const assessmentSections: SectionDef[] = [
  {
    id: 1,
    title: 'Problem-Market Fit',
    questions: [
      {
        fieldName: 'problemClarity',
        type: 'radio',
        label: 'How clearly can you articulate the problem you\'re solving?',
        options: [
          { value: 'very-clear', title: 'Very clearly' },
          { value: 'somewhat-clear', title: 'Somewhat clearly' },
          { value: 'still-refining', title: 'Still refining' },
          { value: 'not-yet', title: 'Not yet defined' },
        ],
      },
      {
        fieldName: 'targetCustomer',
        type: 'textarea',
        label: 'Who is your target customer?',
        helpText: 'Describe them in one sentence.',
        placeholder: 'e.g. Mid-market SaaS companies with 50-500 employees who struggle with...',
        maxLength: 500,
      },
      {
        fieldName: 'marketSize',
        type: 'radio',
        label: 'How large is your addressable market?',
        options: [
          { value: '1b-plus', title: '£1B+' },
          { value: '100m-1b', title: '£100M–£1B' },
          { value: '10m-100m', title: '£10M–£100M' },
          { value: 'under-10m', title: 'Under £10M' },
          { value: 'not-estimated', title: 'Haven\'t estimated' },
        ],
      },
      {
        fieldName: 'competitorAwareness',
        type: 'radio',
        label: 'How well do you understand your competitive landscape?',
        options: [
          { value: 'deep', title: 'Deep understanding' },
          { value: 'general', title: 'General awareness' },
          { value: 'limited', title: 'Limited research' },
          { value: 'not-looked', title: 'Haven\'t looked yet' },
        ],
      },
      {
        fieldName: 'uniqueAdvantage',
        type: 'textarea',
        label: 'What is your unique advantage over existing solutions?',
        placeholder: 'What makes your solution fundamentally better or different?',
        maxLength: 500,
      },
    ],
  },
  {
    id: 2,
    title: 'Product & Traction',
    questions: [
      {
        fieldName: 'productStage',
        type: 'radio',
        label: 'What stage is your product at?',
        options: [
          { value: 'revenue', title: 'Revenue-generating product' },
          { value: 'live-users', title: 'Live product with users' },
          { value: 'mvp', title: 'MVP/beta' },
          { value: 'prototype', title: 'Prototype' },
          { value: 'concept', title: 'Concept/idea only' },
        ],
      },
      {
        fieldName: 'hasPayingCustomers',
        type: 'radio',
        label: 'Do you have paying customers?',
        options: [
          { value: 'yes-recurring', title: 'Yes, recurring revenue' },
          { value: 'yes-oneoff', title: 'Yes, some one-off payments' },
          { value: 'no-free-users', title: 'No, but have free users' },
          { value: 'no-users', title: 'No users yet' },
        ],
      },
      {
        fieldName: 'currentMRR',
        type: 'number',
        label: 'What is your current MRR/ARR?',
        prefix: '£',
        placeholder: 'e.g. 5000',
        conditional: { fieldName: 'hasPayingCustomers', values: ['yes-recurring', 'yes-oneoff'] },
      },
      {
        fieldName: 'customerGrowthRate',
        type: 'radio',
        label: 'What is your customer growth rate (month-over-month)?',
        options: [
          { value: 'over-20', title: '>20%' },
          { value: '10-20', title: '10–20%' },
          { value: '5-10', title: '5–10%' },
          { value: 'under-5', title: '<5%' },
          { value: 'too-early', title: 'Too early to measure' },
        ],
        conditional: { fieldName: 'hasPayingCustomers', values: ['yes-recurring', 'yes-oneoff'] },
      },
      {
        fieldName: 'evidenceOfDemand',
        type: 'multiselect',
        label: 'What evidence of demand do you have?',
        helpText: 'Select all that apply.',
        options: [
          { value: 'paying-customers', title: 'Paying customers' },
          { value: 'signed-lois', title: 'Signed LOIs' },
          { value: 'waitlist', title: 'Waitlist signups' },
          { value: 'user-feedback', title: 'Positive user feedback' },
          { value: 'market-research', title: 'Market research' },
          { value: 'none', title: 'None yet' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Business Model',
    questions: [
      {
        fieldName: 'revenueModelClarity',
        type: 'radio',
        label: 'How clear is your revenue model?',
        options: [
          { value: 'clear-validated', title: 'Clear and validated' },
          { value: 'clear-unvalidated', title: 'Clear but unvalidated' },
          { value: 'exploring', title: 'Exploring options' },
          { value: 'not-defined', title: 'Not yet defined' },
        ],
      },
      {
        fieldName: 'primaryRevenueModel',
        type: 'dropdown',
        label: 'What is your primary revenue model?',
        placeholder: 'Select a revenue model',
        options: [
          { value: 'saas', label: 'SaaS subscription' },
          { value: 'marketplace', label: 'Marketplace/platform' },
          { value: 'transaction', label: 'Transaction fees' },
          { value: 'licensing', label: 'Licensing' },
          { value: 'advertising', label: 'Advertising' },
          { value: 'hardware-software', label: 'Hardware + software' },
          { value: 'services', label: 'Services' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        fieldName: 'unitEconomics',
        type: 'radio',
        label: 'What are your unit economics?',
        options: [
          { value: 'positive-improving', title: 'Positive and improving' },
          { value: 'break-even', title: 'Break-even' },
          { value: 'negative-path', title: 'Negative but path to positive' },
          { value: 'not-calculated', title: 'Haven\'t calculated' },
        ],
      },
      {
        fieldName: 'pricingConfidence',
        type: 'radio',
        label: 'How confident are you in your pricing strategy?',
        options: [
          { value: 'very-confident', title: 'Very confident – tested' },
          { value: 'somewhat-confident', title: 'Somewhat confident' },
          { value: 'experimenting', title: 'Still experimenting' },
          { value: 'not-set', title: 'Haven\'t set pricing' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Team',
    questions: [
      {
        fieldName: 'coFounderCount',
        type: 'radio',
        label: 'How many co-founders are on the team?',
        options: [
          { value: 'solo', title: 'Solo founder' },
          { value: 'two', title: '2 co-founders' },
          { value: 'three-plus', title: '3+ co-founders' },
        ],
      },
      {
        fieldName: 'teamCoverage',
        type: 'radio',
        label: 'Does your team cover all critical functions?',
        helpText: 'Technical, commercial, domain expertise',
        options: [
          { value: 'all-covered', title: 'Yes, all covered' },
          { value: 'most-covered', title: 'Most covered, one gap' },
          { value: 'significant-gaps', title: 'Significant gaps' },
          { value: 'solo-all', title: 'Solo covering everything' },
        ],
      },
      {
        fieldName: 'founderExperience',
        type: 'radio',
        label: 'Have any founders built and exited a company before?',
        options: [
          { value: 'yes-exit', title: 'Yes, successful exit' },
          { value: 'yes-no-exit', title: 'Yes, but unsuccessful' },
          { value: 'industry-exp', title: 'No, but relevant industry experience' },
          { value: 'no-exp', title: 'No prior startup experience' },
        ],
      },
      {
        fieldName: 'fullTimeTeamSize',
        type: 'number',
        label: 'How many full-time team members (including founders)?',
        placeholder: 'e.g. 3',
        min: 1,
      },
    ],
  },
  {
    id: 5,
    title: 'Financials',
    questions: [
      {
        fieldName: 'financialModel',
        type: 'radio',
        label: 'Do you have a financial model/forecast?',
        options: [
          { value: 'detailed-3yr', title: 'Detailed 3-year model' },
          { value: 'basic-projections', title: 'Basic projections' },
          { value: 'rough-estimates', title: 'Rough estimates' },
          { value: 'no-model', title: 'No financial model' },
        ],
      },
      {
        fieldName: 'monthlyBurnRate',
        type: 'number',
        label: 'What is your current monthly burn rate?',
        prefix: '£',
        placeholder: 'e.g. 15000',
        helpText: 'Enter 0 if self-funded with no burn.',
      },
      {
        fieldName: 'runwayMonths',
        type: 'radio',
        label: 'How many months of runway do you have?',
        options: [
          { value: '12-plus', title: '12+ months' },
          { value: '6-12', title: '6–12 months' },
          { value: '3-6', title: '3–6 months' },
          { value: 'under-3', title: 'Less than 3 months' },
          { value: 'self-funded', title: 'Self-funded / no burn' },
        ],
      },
      {
        fieldName: 'priorFunding',
        type: 'radio',
        label: 'Have you raised any funding before?',
        options: [
          { value: 'institutional', title: 'Yes, institutional (VC/angel)' },
          { value: 'grants', title: 'Yes, grants only' },
          { value: 'friends-family', title: 'Yes, friends & family' },
          { value: 'bootstrapped', title: 'Bootstrapped only' },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Go-to-Market',
    questions: [
      {
        fieldName: 'gtmStrategy',
        type: 'radio',
        label: 'Do you have a go-to-market strategy?',
        options: [
          { value: 'detailed-executing', title: 'Detailed and executing' },
          { value: 'planned', title: 'Planned but not started' },
          { value: 'high-level', title: 'High-level ideas' },
          { value: 'none', title: 'No strategy yet' },
        ],
      },
      {
        fieldName: 'acquisitionChannels',
        type: 'multiselect',
        label: 'What are your primary customer acquisition channels?',
        helpText: 'Select all that apply.',
        options: [
          { value: 'content', title: 'Content marketing' },
          { value: 'paid-ads', title: 'Paid advertising' },
          { value: 'sales', title: 'Sales team' },
          { value: 'partnerships', title: 'Partnerships' },
          { value: 'plg', title: 'Product-led growth' },
          { value: 'social', title: 'Social media' },
          { value: 'events', title: 'Events / conferences' },
          { value: 'referrals', title: 'Referrals' },
          { value: 'other', title: 'Other' },
        ],
      },
      {
        fieldName: 'cacKnowledge',
        type: 'radio',
        label: 'What is your customer acquisition cost (CAC)?',
        options: [
          { value: 'known-optimising', title: 'Known and optimising' },
          { value: 'roughly-estimated', title: 'Roughly estimated' },
          { value: 'dont-know', title: 'Don\'t know yet' },
        ],
      },
      {
        fieldName: 'salesRepeatability',
        type: 'radio',
        label: 'How repeatable is your sales process?',
        options: [
          { value: 'highly-repeatable', title: 'Highly repeatable' },
          { value: 'somewhat-repeatable', title: 'Somewhat repeatable' },
          { value: 'ad-hoc', title: 'Ad hoc' },
          { value: 'no-process', title: 'No sales process yet' },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'Legal & IP',
    questions: [
      {
        fieldName: 'companyIncorporation',
        type: 'radio',
        label: 'Is your company properly incorporated?',
        options: [
          { value: 'yes-ltd', title: 'Yes, Ltd company' },
          { value: 'in-progress', title: 'In progress' },
          { value: 'not-yet', title: 'Not yet' },
        ],
      },
      {
        fieldName: 'ipProtection',
        type: 'multiselect',
        label: 'Do you have any intellectual property protection?',
        helpText: 'Select all that apply.',
        options: [
          { value: 'patents', title: 'Patents filed' },
          { value: 'trademarks', title: 'Trademarks registered' },
          { value: 'trade-secrets', title: 'Trade secrets' },
          { value: 'copyright', title: 'Copyright' },
          { value: 'open-source', title: 'Open source strategy' },
          { value: 'no-ip', title: 'No IP protection' },
          { value: 'not-applicable', title: 'Not applicable' },
        ],
      },
      {
        fieldName: 'keyAgreements',
        type: 'radio',
        label: 'Are your key agreements in place?',
        helpText: 'Founder agreements, employment contracts, IP assignment',
        options: [
          { value: 'all-in-place', title: 'All in place' },
          { value: 'most-in-place', title: 'Most in place' },
          { value: 'some-gaps', title: 'Some gaps' },
          { value: 'nothing', title: 'Nothing formalised' },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Investment Readiness',
    questions: [
      {
        fieldName: 'hasPitchDeck',
        type: 'radio',
        label: 'Do you have a pitch deck?',
        options: [
          { value: 'investor-ready', title: 'Yes, investor-ready' },
          { value: 'needs-work', title: 'Yes, but needs work' },
          { value: 'in-progress', title: 'In progress' },
          { value: 'no', title: 'No' },
        ],
      },
      {
        fieldName: 'fundingAskClarity',
        type: 'radio',
        label: 'How clearly can you articulate your funding ask?',
        options: [
          { value: 'clear-ask', title: 'Clear ask with use of funds' },
          { value: 'general-idea', title: 'General idea' },
          { value: 'not-defined', title: 'Not yet defined' },
        ],
      },
      {
        fieldName: 'investmentStage',
        type: 'dropdown',
        label: 'What investment stage are you targeting?',
        placeholder: 'Select a stage',
        options: [
          { value: 'pre-seed', label: 'Pre-seed' },
          { value: 'seed', label: 'Seed' },
          { value: 'series-a', label: 'Series A' },
          { value: 'grant', label: 'Grant funding' },
          { value: 'angel', label: 'Angel investment' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        fieldName: 'investorConversations',
        type: 'radio',
        label: 'Have you had any investor conversations?',
        options: [
          { value: 'active-discussions', title: 'Yes, active discussions' },
          { value: 'initial-meetings', title: 'Yes, initial meetings' },
          { value: 'informal', title: 'Informal conversations' },
          { value: 'not-yet', title: 'Not yet' },
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Metrics & Data',
    questions: [
      {
        fieldName: 'trackingMetrics',
        type: 'radio',
        label: 'Are you tracking key business metrics?',
        options: [
          { value: 'comprehensive', title: 'Comprehensive dashboard' },
          { value: 'basics', title: 'Tracking basics' },
          { value: 'ad-hoc', title: 'Ad hoc tracking' },
          { value: 'not-tracking', title: 'Not tracking' },
        ],
      },
      {
        fieldName: 'metricsTracked',
        type: 'multiselect',
        label: 'Which metrics do you track regularly?',
        helpText: 'Select all that apply.',
        options: [
          { value: 'mrr-arr', title: 'MRR/ARR' },
          { value: 'cac', title: 'Customer acquisition cost' },
          { value: 'ltv', title: 'Lifetime value' },
          { value: 'churn', title: 'Churn rate' },
          { value: 'mau', title: 'Monthly active users' },
          { value: 'conversion', title: 'Conversion rate' },
          { value: 'burn-rate', title: 'Burn rate' },
          { value: 'none', title: 'None of these' },
        ],
      },
      {
        fieldName: 'canDemonstrateGrowth',
        type: 'radio',
        label: 'Can you demonstrate growth trends with data?',
        options: [
          { value: 'clear-trends', title: 'Yes, clear upward trends' },
          { value: 'mixed', title: 'Mixed results' },
          { value: 'too-early', title: 'Too early for trends' },
          { value: 'no-data', title: 'No data' },
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Vision & Scalability',
    questions: [
      {
        fieldName: 'visionScale',
        type: 'radio',
        label: 'How big could this become in 5–10 years?',
        options: [
          { value: '100m-plus', title: '£100M+ revenue potential' },
          { value: '10m-100m', title: '£10M–£100M' },
          { value: '1m-10m', title: '£1M–£10M' },
          { value: 'lifestyle', title: 'Lifestyle business' },
          { value: 'not-thought', title: 'Haven\'t thought that far' },
        ],
      },
      {
        fieldName: 'scalabilityStrategy',
        type: 'textarea',
        label: 'What is your scalability strategy?',
        placeholder: 'How will you grow from current stage to 10x, 100x?',
        maxLength: 500,
      },
      {
        fieldName: 'biggestRisks',
        type: 'textarea',
        label: 'What are the biggest risks to your business, and how are you mitigating them?',
        placeholder: 'Describe your top 2-3 risks and mitigation strategies.',
        maxLength: 500,
      },
    ],
  },
  {
    id: 11,
    title: 'Contact Information',
    questions: [
      {
        fieldName: 'contactName',
        type: 'text',
        label: 'Your full name',
        placeholder: 'e.g. Jane Smith',
        required: true,
      },
      {
        fieldName: 'contactEmail',
        type: 'email',
        label: 'Email address',
        placeholder: 'e.g. jane@startup.com',
        helpText: 'We\'ll send your assessment results here.',
        required: true,
      },
      {
        fieldName: 'contactCompany',
        type: 'text',
        label: 'Company name',
        placeholder: 'e.g. Acme Ltd',
        required: false,
      },
      {
        fieldName: 'contactLinkedin',
        type: 'text',
        label: 'LinkedIn profile URL',
        placeholder: 'https://linkedin.com/in/yourprofile',
        helpText: 'Optional — helps us personalise your results.',
        required: false,
      },
      {
        fieldName: 'contactSource',
        type: 'dropdown',
        label: 'How did you hear about this tool?',
        placeholder: 'Select an option',
        options: [
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'twitter', label: 'Twitter/X' },
          { value: 'google', label: 'Google search' },
          { value: 'referral', label: 'Referral' },
          { value: 'e3-website', label: 'E3 Digital website' },
          { value: 'event', label: 'Event' },
          { value: 'other', label: 'Other' },
        ],
        required: false,
      },
    ],
  },
];
