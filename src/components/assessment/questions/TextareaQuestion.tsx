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
};

export default function TextareaQuestion({
  name,
  label,
  placeholder,
  helpText,
  maxLength,
  required,
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

  return (
    <div className="animate-fade-in">
      <label className="mb-1 block text-xl font-semibold text-text-primary">
        {label}
        {required && <span className="ml-1 text-score-red">*</span>}
      </label>
      {helpText && <p className="mb-4 text-sm text-text-secondary">{helpText}</p>}
      <textarea
        name={fieldName}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        onKeyDown={handleKeyDown}
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
        <p className="animate-fade-in mt-2 text-sm text-score-red">{error.message}</p>
      )}
    </div>
  );
}
