import CategoryBar from './CategoryBar';

export type CategoryScore = {
  name: string;
  score: number;
};

type Props = {
  categories: CategoryScore[];
  timeLabel: string;
};

export default function CategoryBreakdown({ categories, timeLabel }: Props) {
  return (
    <div className="rounded-xl border border-card-border bg-white p-6 shadow-card">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Category Breakdown</h2>
        <span className="text-xs text-text-muted">
          Last updated:
          {' '}
          {timeLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-12 md:gap-y-6">
        {categories.map((cat, index) => (
          <CategoryBar key={cat.name} name={cat.name} score={cat.score} index={index} />
        ))}
      </div>
    </div>
  );
}
