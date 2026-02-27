'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  name: string;
  score: number;
  index: number;
};

function getBarColor(score: number): string {
  if (score >= 75) {
    return '#22c55e';
  }
  if (score >= 60) {
    return '#3b82f6';
  }
  if (score >= 40) {
    return '#f97316';
  }
  return '#ef4444';
}

function getScoreTextColor(score: number): string {
  if (score >= 75) {
    return 'text-score-green';
  }
  if (score >= 60) {
    return 'text-score-blue';
  }
  if (score >= 40) {
    return 'text-score-orange';
  }
  return 'text-score-red';
}

export default function CategoryBar({ name, score, index }: Props) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setTimeout(() => {
            setWidth(score);
          }, index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [score, index]);

  const barColor = getBarColor(score);
  const textColorClass = getScoreTextColor(score);

  return (
    <div ref={ref}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{name}</span>
        <span className={`text-sm font-semibold ${textColorClass}`}>
          {score}
          %
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-card-border">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
