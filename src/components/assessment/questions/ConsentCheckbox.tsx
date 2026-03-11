'use client';

import Link from 'next/link';
import { useController, useFormContext } from 'react-hook-form';

import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type ConsentCheckboxProps = {
  name: keyof AssessmentFormData;
  animationDelay?: number;
};

export default function ConsentCheckbox({ name, animationDelay = 0 }: ConsentCheckboxProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div
      className={cn(error ? 'animate-shake' : 'animate-fade-in')}
      style={!error ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      <div className="flex items-start gap-3">
        <input
          id="consent-checkbox"
          type="checkbox"
          checked={Boolean(field.value)}
          onChange={e => field.onChange(e.target.checked)}
          className="mt-0.5 size-5 cursor-pointer rounded border-card-border accent-accent-blue"
        />
        <label htmlFor="consent-checkbox" className="cursor-pointer text-sm text-text-secondary">
          {'I agree to the '}
          <Link
            href="/privacy"
            className="text-accent-blue underline hover:text-accent-blue-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          {' and consent to receiving my assessment results via email.'}
        </label>
      </div>
      {error && (
        <p className="animate-fade-in mt-2 text-sm text-score-red">{error.message}</p>
      )}
    </div>
  );
}
