'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { DropdownOption } from '@/data/assessment-questions';
import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type DropdownQuestionProps = {
  name: keyof AssessmentFormData;
  label: string;
  options: DropdownOption[];
  placeholder?: string;
  helpText?: string;
  required?: boolean;
};

export default function DropdownQuestion({
  name,
  label,
  options,
  placeholder,
  helpText,
  required,
}: DropdownQuestionProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field: { onChange, onBlur, ref, value: rawValue, name: fieldName },
    fieldState: { error },
  } = useController({ name, control });

  const value = typeof rawValue === 'string' ? rawValue : '';

  return (
    <div className="animate-fade-in">
      <label className="mb-1 block text-xl font-semibold text-text-primary">
        {label}
        {required && <span className="ml-1 text-score-red">*</span>}
      </label>
      {helpText && <p className="mb-4 text-sm text-text-secondary">{helpText}</p>}
      <div className="relative">
        <select
          name={fieldName}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          className={cn(
            'w-full cursor-pointer appearance-none rounded-lg border border-card-border bg-white p-3',
            'text-text-primary focus:border-accent-blue focus:outline-none',
            !value && 'text-text-muted',
            error && 'border-score-red',
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5 text-text-muted"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="animate-fade-in mt-2 text-sm text-score-red">{error.message}</p>
      )}
    </div>
  );
}
