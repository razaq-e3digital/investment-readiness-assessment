'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type TextareaQuestionProps = {
  name: keyof AssessmentFormData;
  label: string;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  required?: boolean;
  animationDelay?: number;
};

export default function TextareaQuestion({
  name,
  label,
  placeholder,
  helpText,
  maxLength,
  required,
  animationDelay = 0,
}: TextareaQuestionProps) {
  const { control } = useFormContext<AssessmentFormData>();
  const {
    field: { onChange, onBlur, ref, value: rawValue, name: fieldName },
    fieldState: { error },
  } = useController({ name, control });

  const value = typeof rawValue === 'string' ? rawValue : '';
  const charCount = value.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Shift+Enter for newlines; Enter alone is handled by the parent form
    if (e.key === 'Enter' && !e.shiftKey) {
      e.stopPropagation();
    }
  };

  const textareaId = `field-${fieldName}`;
  const errorId = `${textareaId}-error`;

  return (
    <div
      className={cn(error ? 'animate-shake' : 'animate-fade-in')}
      style={!error ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      <label htmlFor={textareaId} className="mb-1 block text-xl font-semibold text-text-primary">
        {label}
        {required && <span className="ml-1 text-score-red" aria-hidden="true">*</span>}
      </label>
      {helpText && <p className="mb-4 text-sm text-text-secondary">{helpText}</p>}
      <textarea
        id={textareaId}
        name={fieldName}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        onKeyDown={handleKeyDown}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full resize-none rounded-lg border border-card-border bg-white p-3 text-text-primary',
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
