'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type TextQuestionProps = {
  name: keyof AssessmentFormData;
  label: string;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  required?: boolean;
  animationDelay?: number;
};

export default function TextQuestion({
  name,
  label,
  placeholder,
  helpText,
  maxLength,
  required,
  animationDelay = 0,
}: TextQuestionProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field: { onChange, onBlur, ref, value: rawValue, name: fieldName },
    fieldState: { error },
  } = useController({ name, control });

  const value = typeof rawValue === 'string' ? rawValue : '';
  const charCount = value.length;

  const inputId = `field-${fieldName}`;
  const errorId = `${inputId}-error`;

  return (
    <div
      className={cn(error ? 'animate-shake' : 'animate-fade-in')}
      style={!error ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      <label htmlFor={inputId} className="mb-1 block text-xl font-semibold text-text-primary">
        {label}
        {required && <span className="ml-1 text-score-red" aria-hidden="true">*</span>}
      </label>
      {helpText && <p className="mb-4 text-sm text-text-secondary">{helpText}</p>}
      <input
        id={inputId}
        type="text"
        name={fieldName}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-lg border border-card-border bg-white p-3 text-text-primary',
          'focus:border-accent-blue focus:outline-none focus:ring-0',
          error && 'border-score-red',
        )}
      />
      {maxLength && (
        <p className="mt-1 text-right text-xs text-text-muted">
          {charCount}
          {' / '}
          {maxLength}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="animate-fade-in mt-2 text-sm text-score-red">
          {error.message}
        </p>
      )}
    </div>
  );
}
