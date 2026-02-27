'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { OptionItem } from '@/data/assessment-questions';
import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type RadioCardQuestionProps = {
  name: keyof AssessmentFormData;
  label: string;
  options: OptionItem[];
  helpText?: string;
};

export default function RadioCardQuestion({
  name,
  label,
  options,
  helpText,
}: RadioCardQuestionProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const handleSelect = (value: string) => {
    field.onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, value: string, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(value);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = options[index + 1];
      if (next) {
        const el = document.getElementById(`radio-${name}-${next.value}`);
        el?.focus();
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = options[index - 1];
      if (prev) {
        const el = document.getElementById(`radio-${name}-${prev.value}`);
        el?.focus();
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <label className="mb-1 block text-xl font-semibold text-text-primary">{label}</label>
      {helpText && <p className="mb-4 text-sm text-text-secondary">{helpText}</p>}
      <div className="flex flex-col gap-3">
        {options.map((option, index) => {
          const isSelected = field.value === option.value;
          return (
            <div
              id={`radio-${name}-${option.value}`}
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelect(option.value)}
              onKeyDown={e => handleKeyDown(e, option.value, index)}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-150',
                isSelected
                  ? 'border-accent-blue bg-blue-50'
                  : 'border-card-border bg-white hover:border-slate-300 hover:shadow-card',
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <span className="text-sm font-semibold text-text-secondary">
                  {option.title.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">{option.title}</p>
                {option.description && (
                  <p className="mt-0.5 text-sm text-text-secondary">{option.description}</p>
                )}
              </div>
              <div
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150',
                  isSelected
                    ? 'border-accent-blue bg-accent-blue'
                    : 'border-card-border bg-white',
                )}
              >
                {isSelected && (
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-3"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="animate-fade-in mt-2 text-sm text-score-red">{error.message}</p>
      )}
    </div>
  );
}
