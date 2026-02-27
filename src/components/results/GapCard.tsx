export type GapData = {
  title: string;
  currentState: string;
  recommendedActions: string[];
};

type Props = {
  gap: GapData;
  index: number;
};

// Static icons for gap positions 0-2; falls back to a generic icon for extras
const GAP_ICONS = ['🎯', '📊', '💡'];

export default function GapCard({ gap, index }: Props) {
  const icon = GAP_ICONS[index] ?? '⚡';

  return (
    <div className="flex h-full flex-col rounded-xl border border-card-border bg-white p-6 shadow-card">
      {/* Icon */}
      <div className="mb-4 text-2xl" aria-hidden="true">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{gap.title}</h3>

      {/* Description */}
      <p className="mb-4 grow text-sm text-text-secondary">{gap.currentState}</p>

      {/* Actions list */}
      {gap.recommendedActions.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {gap.recommendedActions.map(action => (
            <li key={action} className="flex gap-2 text-xs text-text-secondary">
              <span className="mt-0.5 size-1.5 flex-none rounded-full bg-accent-blue" aria-hidden="true" />
              {action}
            </li>
          ))}
        </ul>
      )}

      {/* See Resource link */}
      <a
        href="#details"
        className="mt-auto text-sm font-medium text-accent-blue transition-colors hover:text-accent-blue-hover"
      >
        See Resource →
      </a>
    </div>
  );
}
