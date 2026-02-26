type FormNavigationProps = {
  currentSection: number;
  totalSections: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
};

export default function FormNavigation({
  currentSection,
  totalSections,
  onBack,
  onNext,
  isSubmitting,
}: FormNavigationProps) {
  const isLastSection = currentSection === totalSections - 1;

  return (
    <div className="border-t border-card-border">
      <div className="flex items-center justify-between py-6">
        <div>
          {currentSection > 0 && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              ← Back
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="rounded-lg bg-accent-blue px-6 py-3 text-base font-semibold text-white hover:bg-accent-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? 'Submitting...'
            : isLastSection
              ? 'Submit Assessment'
              : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
