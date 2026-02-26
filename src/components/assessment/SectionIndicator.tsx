import { cn } from '@/utils/Helpers';

type SectionIndicatorProps = {
  sections: string[];
  currentSection: number;
  completedSections: Set<number>;
  onNavigate: (index: number) => void;
};

export default function SectionIndicator({
  sections,
  currentSection,
  completedSections,
  onNavigate,
}: SectionIndicatorProps) {
  return (
    <div className="hidden items-center gap-1.5 overflow-x-auto pb-1 sm:flex">
      {sections.map((title, index) => {
        const isCompleted = completedSections.has(index);
        const isCurrent = index === currentSection;
        const isClickable = isCompleted && index < currentSection;

        return (
          <button
            key={title}
            type="button"
            title={title}
            aria-label={`Go to section: ${title}`}
            disabled={!isClickable}
            onClick={() => {
              if (isClickable) {
                onNavigate(index);
              }
            }}
            className={cn(
              'h-2 shrink-0 rounded-full transition-all duration-300',
              isCurrent && 'w-6 bg-accent-blue',
              isCompleted && !isCurrent && 'w-2 cursor-pointer bg-accent-blue opacity-60 hover:opacity-100',
              !isCurrent && !isCompleted && 'w-2 cursor-default bg-card-border',
            )}
          />
        );
      })}
    </div>
  );
}
