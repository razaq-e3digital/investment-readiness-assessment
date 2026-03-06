'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type EmailQuestionProps = {
  name: keyof AssessmentFormData;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
};

export default function EmailQuestion({
  name,
  label,
  placeholder,
  helpText,
  required,
}: EmailQuestionProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field: { onChange, onBlur, ref, value: rawValue, name: fieldName },
    fieldState: { error },
  } = useController({ name, control });

  const value = typeof rawValue === 'string' ? rawValue : '';

  const inputId = `field-${fieldName}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="animate-fade-in">
      <label htmlFor={inputId} className="mb-1 block text-xl font-semibold text-text-primary">
        {label}
        {required && <span className="ml-1 text-score-red" aria-hidden="true">*</span>}
      </label>
      {helpText && <p className="mb-4 text-sm text-text-secondary">{helpText}</p>}
      <input
        id={inputId}
        type="email"
        name={fieldName}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-lg border border-card-border bg-white p-3 text-text-primary',
          'focus:border-accent-blue focus:outline-none focus:ring-0',
          error && 'border-score-red',
        )}
      />
      {error && (
        <p id={errorId} role="alert" className="animate-fade-in mt-2 text-sm text-score-red">
          {error.message}
        </p>
      )}
    </div>
  );
}
