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

function QuestionDispatcher({ question, animationDelay }: { question: QuestionDef; animationDelay: number }) {
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
          animationDelay={animationDelay}
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
          animationDelay={animationDelay}
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
          animationDelay={animationDelay}
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
          animationDelay={animationDelay}
        />
      );
    case 'radio':
      return (
        <RadioCardQuestion
          name={question.fieldName}
          label={question.label}
          options={question.options}
          helpText={question.helpText}
          animationDelay={animationDelay}
        />
      );
    case 'multiselect':
      return (
        <MultiSelectQuestion
          name={question.fieldName}
          label={question.label}
          options={question.options}
          helpText={question.helpText}
          animationDelay={animationDelay}
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
          animationDelay={animationDelay}
        />
      );
    case 'checkbox':
      return <ConsentCheckbox name={question.fieldName} animationDelay={animationDelay} />;
    default:
      return null;
  }
}

function SectionRenderer({ sectionIndex, shakeKey }: { sectionIndex: number; shakeKey: number }) {
  // Hooks must be called before any early returns (Rules of Hooks)
  const { watch, formState: { errors } } = useFormContext<AssessmentFormData>();
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
        {section.questions.map((question, index) => {
          if (question.conditional) {
            const watchedValue
              = question.conditional.fieldName === 'hasPayingCustomers'
                ? hasPayingCustomers
                : '';
            if (!question.conditional.values.includes(watchedValue)) {
              return null;
            }
          }

          const hasError = errors[question.fieldName] !== undefined;
          const questionKey = hasError ? `${question.fieldName}-err-${shakeKey}` : question.fieldName;
          const animationDelay = Math.min(index * 100, 500);

          return (
            <QuestionDispatcher
              key={questionKey}
              question={question}
              animationDelay={animationDelay}
            />
          );
        })}

        {sectionIndex === assessmentSections.length - 1 && (
          <ConsentCheckbox
            key={errors.consentChecked !== undefined ? `consentChecked-err-${shakeKey}` : 'consentChecked'}
            name="consentChecked"
            animationDelay={Math.min(section.questions.length * 100, 500)}
          />
        )}
      </div>
    </div>
  );
}

export default function AssessmentForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isExiting, setIsExiting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
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
    if (isExiting) {
      return;
    }
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
      setShakeKey(prev => prev + 1);
      return;
    }
    setCompletedSections(prev => new Set([...prev, currentSection]));
    setDirection('forward');
    setIsExiting(true);
    setTimeout(() => {
      setCurrentSection(prev => Math.min(prev + 1, totalSections - 1));
      setIsExiting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const handleBack = () => {
    if (isExiting) {
      return;
    }
    setDirection('backward');
    setIsExiting(true);
    setTimeout(() => {
      setCurrentSection(prev => Math.max(prev - 1, 0));
      setIsExiting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const handleNavigate = (index: number) => {
    if (index < currentSection) {
      setDirection('backward');
      setCurrentSection(index);
    }
  };

  const handleSubmit = async () => {
    if (isExiting) {
      return;
    }
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
      setShakeKey(prev => prev + 1);
      return;
    }

    // Generate reCAPTCHA token (returns '' if key is not configured)
    let recaptchaToken = '';
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey) {
      try {
        recaptchaToken = await getRecaptchaToken(siteKey, 'assessment_submit');
      } catch {
        // Belt-and-suspenders: the recaptcha module handles errors internally
        // but the form must never crash regardless of reCAPTCHA state
        recaptchaToken = '';
      }
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
  const exitClass = direction === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right';
  const enterClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  const animClass = isExiting ? exitClass : enterClass;
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
            <SectionRenderer sectionIndex={currentSection} shakeKey={shakeKey} />
          </div>

          <FormNavigation
            currentSection={currentSection}
            totalSections={totalSections}
            onBack={handleBack}
            onNext={isLastSection ? handleSubmit : handleNext}
            isSubmitting={false}
            disabled={isExiting}
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
