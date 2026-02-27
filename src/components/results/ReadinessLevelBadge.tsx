export type ReadinessLevel = 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early';

type BadgeConfig = {
  label: string;
  className: string;
  icon: string;
};

const BADGE_CONFIG: Record<ReadinessLevel, BadgeConfig> = {
  investment_ready: {
    label: 'Investment Ready',
    className: 'bg-[#dcfce7] text-[#22c55e]',
    icon: '🚀',
  },
  nearly_there: {
    label: 'Nearly There',
    className: 'bg-[#d1fae5] text-[#10b981]',
    icon: '🎯',
  },
  early_stage: {
    label: 'Early Stage',
    className: 'bg-[#ffedd5] text-[#f97316]',
    icon: '🌱',
  },
  too_early: {
    label: 'Too Early',
    className: 'bg-[#fee2e2] text-[#ef4444]',
    icon: '🧭',
  },
};

type Props = {
  level: ReadinessLevel;
};

export default function ReadinessLevelBadge({ level }: Props) {
  const config = BADGE_CONFIG[level] ?? BADGE_CONFIG.early_stage;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${config.className}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
