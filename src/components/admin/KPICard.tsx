import { TrendingDown, TrendingUp } from 'lucide-react';

type Props = {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
};

export default function KPICard({ label, value, change, icon, iconBg }: Props) {
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-card-border bg-white p-6 shadow-card">
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isPositive
              ? 'bg-score-green-bg text-score-green'
              : 'bg-score-red-bg text-score-red'
          }`}
        >
          {isPositive
            ? (
                <TrendingUp className="size-3" />
              )
            : (
                <TrendingDown className="size-3" />
              )}
          {isPositive ? '+' : ''}
          {change}
          %
        </span>
      </div>

      {/* Label */}
      <p className="mt-4 text-sm text-text-secondary">{label}</p>

      {/* Value */}
      <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
    </div>
  );
}
