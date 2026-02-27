'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { OptionItem } from '@/data/assessment-questions';
import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type MultiSelectQuestionProps = {
  name: keyof AssessmentFormData;
  label: string;
  options: OptionItem[];
  helpText?: string;
};

export default function MultiSelectQuestion({
  name,
  label,
  options,
  helpText,
}: MultiSelectQuestionProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const selectedValues: string[] = Array.isArray(field.value) ? (field.value as string[]) : [];

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      field.onChange(selectedValues.filter(v => v !== value));
    } else {
      field.onChange([...selectedValues, value]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(value);
    }
  };

  return (
    <div className="animate-fade-in">
      <label className="mb-1 block text-xl font-semibold text-text-primary">{label}</label>
      {helpText && <p className="mb-4 text-sm text-text-secondary">{helpText}</p>}
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <div
              key={option.value}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleToggle(option.value)}
              onKeyDown={e => handleKeyDown(e, option.value)}
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
                  'flex size-6 shrink-0 items-center justify-center rounded border-2 transition-all duration-150',
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
