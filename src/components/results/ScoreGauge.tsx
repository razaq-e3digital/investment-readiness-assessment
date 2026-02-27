'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  score: number;
};

// Full circle circumference at r=44 in a 100×100 viewBox
const CIRCUMFERENCE = 2 * Math.PI * 44; // ≈ 276.46
const ANIMATION_DURATION = 1500; // ms

function getArcColor(score: number): string {
  if (score >= 75) {
    return '#22c55e';
  }
  if (score >= 50) {
    return '#eab308';
  }
  if (score >= 25) {
    return '#f97316';
  }
  return '#ef4444';
}

export default function ScoreGauge({ score }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      return;
    }
    hasAnimated.current = true;

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      // Ease-out cubic
      const eased = 1 - (1 - progress) ** 3;

      setDisplayScore(Math.round(score * eased));
      setDashOffset(CIRCUMFERENCE * (1 - (score / 100) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [score]);

  const arcColor = getArcColor(score);

  return (
    <div className="relative size-[200px]" role="img" aria-label={`Score: ${score} out of 100`}>
      {/* SVG arcs — rotated so fill starts from 12 o'clock */}
      <svg
        className="absolute inset-0 size-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={arcColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Centred score text — not rotated */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold leading-none text-white">{displayScore}</span>
        <span className="mt-1 text-xs uppercase tracking-wider text-text-muted">SCORE</span>
      </div>
    </div>
  );
}
