'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import type { QuestionDef } from '@/data/assessment-questions';
import { assessmentSections } from '@/data/assessment-questions';
import { getRecaptchaToken, loadRecaptchaScript } from '@/lib/recaptcha';
import { sectionValidators } from '@/lib/validation/assessment-schema';
import type { AssessmentFormData } from '@/types/assessment';

import AssessmentNavbar from './AssessmentNavbar';
import FormNavigation from './FormNavigation';
import ProcessingScreen from './ProcessingScreen';
import ProgressBar from './ProgressBar';
import ConsentCheckbox from './questions/ConsentCheckbox';
import DropdownQuestion from './questions/DropdownQuestion';
import EmailQuestion from './questions/EmailQuestion';
import MultiSelectQuestion from './questions/MultiSelectQuestion';
import NumberQuestion from './questions/NumberQuestion';
import RadioCardQuestion from './questions/RadioCardQuestion';
import TextareaQuestion from './questions/TextareaQuestion';
import TextQuestion from './questions/TextQuestion';
import SectionIndicator from './SectionIndicator';

type ProcessingData = {
  formData: AssessmentFormData;
  recaptchaToken: string;
};

function QuestionDispatcher({ question }: { question: QuestionDef }) {
  switch (question.type) {
    case 'text':
      return (
        <TextQuestion
          name={question.fieldName}
          label={question.label}
          placeholder={question.placeholder}
          helpText={question.helpText}
          maxLength={question.maxLength}
          required={question.required}
        />
      );
    case 'textarea':
      return (
        <TextareaQuestion
          name={question.fieldName}
          label={question.label}
          placeholder={question.placeholder}
          helpText={question.helpText}
          maxLength={question.maxLength}
          required={question.required}
        />
      );
    case 'email':
      return (
        <EmailQuestion
          name={question.fieldName}
          label={question.label}
          placeholder={question.placeholder}
          helpText={question.helpText}
          required={question.required}
        />
      );
    case 'number':
      return (
        <NumberQuestion
          name={question.fieldName}
          label={question.label}
          placeholder={question.placeholder}
          helpText={question.helpText}
          required={question.required}
          prefix={question.prefix}
          suffix={question.suffix}
          min={question.min}
        />
      );
    case 'radio':
      return (
        <RadioCardQuestion
          name={question.fieldName}
          label={question.label}
          options={question.options}
          helpText={question.helpText}
        />
      );
    case 'multiselect':
      return (
        <MultiSelectQuestion
          name={question.fieldName}
          label={question.label}
          options={question.options}
          helpText={question.helpText}
        />
      );
    case 'dropdown':
      return (
        <DropdownQuestion
          name={question.fieldName}
          label={question.label}
          options={question.options}
          placeholder={question.placeholder}
          helpText={question.helpText}
          required={question.required}
        />
      );
    case 'checkbox':
      return <ConsentCheckbox name={question.fieldName} />;
    default:
      return null;
  }
}

function SectionRenderer({ sectionIndex }: { sectionIndex: number }) {
  // Hooks must be called before any early returns (Rules of Hooks)
  const { watch } = useFormContext<AssessmentFormData>();
  const hasPayingCustomers = watch('hasPayingCustomers');

  const section = assessmentSections[sectionIndex];
  if (!section) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{section.title}</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {`Section ${sectionIndex + 1} of ${assessmentSections.length}`}
        </p>
      </div>

      <div className="space-y-8 rounded-xl border border-card-border bg-white p-6 md:p-8">
        {section.questions.map((question) => {
          if (question.conditional) {
            const watchedValue
              = question.conditional.fieldName === 'hasPayingCustomers'
                ? hasPayingCustomers
                : '';
            if (!question.conditional.values.includes(watchedValue)) {
              return null;
            }
          }

          return <QuestionDispatcher key={question.fieldName} question={question} />;
        })}

        {sectionIndex === assessmentSections.length - 1 && (
          <ConsentCheckbox name="consentChecked" />
        )}
      </div>
    </div>
  );
}

export default function AssessmentForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [processingData, setProcessingData] = useState<ProcessingData | null>(null);

  const methods = useForm<AssessmentFormData>({
    defaultValues: {
      problemClarity: '',
      targetCustomer: '',
      marketSize: '',
      competitorAwareness: '',
      uniqueAdvantage: '',
      productStage: '',
      hasPayingCustomers: '',
      currentMRR: '',
      customerGrowthRate: '',
      evidenceOfDemand: [],
      revenueModelClarity: '',
      primaryRevenueModel: '',
      unitEconomics: '',
      pricingConfidence: '',
      coFounderCount: '',
      teamCoverage: '',
      founderExperience: '',
      fullTimeTeamSize: '',
      financialModel: '',
      monthlyBurnRate: '',
      runwayMonths: '',
      priorFunding: '',
      gtmStrategy: '',
      acquisitionChannels: [],
      cacKnowledge: '',
      salesRepeatability: '',
      companyIncorporation: '',
      ipProtection: [],
      keyAgreements: '',
      hasPitchDeck: '',
      fundingAskClarity: '',
      investmentStage: '',
      investorConversations: '',
      trackingMetrics: '',
      metricsTracked: [],
      canDemonstrateGrowth: '',
      visionScale: '',
      scalabilityStrategy: '',
      biggestRisks: '',
      contactName: '',
      contactEmail: '',
      contactCompany: '',
      contactLinkedin: '',
      contactSource: '',
      consentChecked: false,
    },
    mode: 'onSubmit',
  });

  // Load reCAPTCHA script early so the token is ready when the user submits
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey) {
      loadRecaptchaScript(siteKey);
    }
  }, []);

  const totalSections = assessmentSections.length;

  const handleNext = async () => {
    const values = methods.getValues();
    const validator = sectionValidators[currentSection];
    if (!validator) {
      return;
    }
    const result = await validator(values as Record<string, unknown>);
    if (!result.success) {
      Object.entries(result.errors).forEach(([field, message]) => {
        methods.setError(field as keyof AssessmentFormData, { message });
      });
      return;
    }
    setCompletedSections(prev => new Set([...prev, currentSection]));
    setDirection('forward');
    setCurrentSection(prev => Math.min(prev + 1, totalSections - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setDirection('backward');
    setCurrentSection(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (index: number) => {
    if (index < currentSection) {
      setDirection('backward');
      setCurrentSection(index);
    }
  };

  const handleSubmit = async () => {
    const values = methods.getValues();
    const validator = sectionValidators[currentSection];
    if (!validator) {
      return;
    }
    const result = await validator(values as Record<string, unknown>);
    if (!result.success) {
      Object.entries(result.errors).forEach(([field, message]) => {
        methods.setError(field as keyof AssessmentFormData, { message });
      });
      return;
    }

    // Generate reCAPTCHA token (returns '' if key is not configured)
    let recaptchaToken = '';
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey) {
      recaptchaToken = await getRecaptchaToken(siteKey, 'assessment_submit');
    }

    // Show the processing screen — it handles the API call from here
    setProcessingData({ formData: methods.getValues(), recaptchaToken });
  };

  const handleReturnToForm = (errors?: Record<string, string>) => {
    setProcessingData(null);
    if (errors) {
      Object.entries(errors).forEach(([field, message]) => {
        methods.setError(field as keyof AssessmentFormData, { message });
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      void handleNext();
    }
  };

  // Show processing screen (takes over entire viewport)
  if (processingData) {
    return (
      <ProcessingScreen
        formData={processingData.formData}
        recaptchaToken={processingData.recaptchaToken}
        onReturnToForm={handleReturnToForm}
      />
    );
  }

  const isLastSection = currentSection === totalSections - 1;
  const animClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  const sectionTitles = assessmentSections.map(s => s.title);

  return (
    <FormProvider {...methods}>
      <div
        className="min-h-screen bg-page-bg"
        role="presentation"
        onKeyDown={handleKeyDown}
      >
        <AssessmentNavbar />

        <div className="border-b border-card-border bg-white px-6 py-4">
          <div className="mx-auto max-w-4xl">
            <ProgressBar
              currentSection={currentSection + 1}
              totalSections={totalSections}
            />
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-4">
          <SectionIndicator
            sections={sectionTitles}
            currentSection={currentSection}
            completedSections={completedSections}
            onNavigate={handleNavigate}
          />
        </div>

        <main className="mx-auto max-w-2xl px-6 pb-8">
          <div key={currentSection} className={animClass}>
            <SectionRenderer sectionIndex={currentSection} />
          </div>

          <FormNavigation
            currentSection={currentSection}
            totalSections={totalSections}
            onBack={handleBack}
            onNext={isLastSection ? handleSubmit : handleNext}
            isSubmitting={false}
          />
        </main>

        <footer className="py-6 text-center">
          <p className="text-xs text-text-muted">
            © 2025 E3 Digital. All rights reserved.
          </p>
        </footer>
      </div>
    </FormProvider>
  );
}
