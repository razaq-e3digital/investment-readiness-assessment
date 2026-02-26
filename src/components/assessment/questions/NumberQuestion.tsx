'use client';

import { useController, useFormContext } from 'react-hook-form';

import type { AssessmentFormData } from '@/types/assessment';
import { cn } from '@/utils/Helpers';

type NumberQuestionProps = {
  name: keyof AssessmentFormData;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  prefix?: string;
  suffix?: string;
  min?: number;
};

export default function NumberQuestion({
  name,
  label,
  placeholder,
  helpText,
  required,
  prefix,
  suffix,
}: NumberQuestionProps) {
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
      <div className="flex items-center overflow-hidden rounded-lg border border-card-border bg-white focus-within:border-accent-blue">
        {prefix && (
          <span className="flex items-center self-stretch border-r border-card-border bg-slate-50 px-3 text-text-secondary">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name={fieldName}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent p-3 text-text-primary outline-none',
            error && 'text-score-red',
          )}
        />
        {suffix && (
          <span className="flex items-center self-stretch border-l border-card-border bg-slate-50 px-3 text-text-secondary">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="animate-fade-in mt-2 text-sm text-score-red">{error.message}</p>
      )}
    </div>
  );
}
