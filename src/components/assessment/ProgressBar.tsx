type ProgressBarProps = {
  currentSection: number;
  totalSections: number;
};

export default function ProgressBar({ currentSection, totalSections }: ProgressBarProps) {
  const percent = Math.round((currentSection / totalSections) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {`Section ${currentSection} of ${totalSections}`}
        </span>
        <span className="text-xs font-medium text-text-secondary">
          {`${percent}% Completed`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-card-border">
        <div
          className="h-full rounded-full bg-accent-blue transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
