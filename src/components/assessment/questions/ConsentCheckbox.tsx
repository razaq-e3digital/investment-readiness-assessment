'use client';

import Link from 'next/link';
import { useController, useFormContext } from 'react-hook-form';

import type { AssessmentFormData } from '@/types/assessment';

type ConsentCheckboxProps = {
  name: keyof AssessmentFormData;
};

export default function ConsentCheckbox({ name }: ConsentCheckboxProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div className="animate-fade-in">
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
