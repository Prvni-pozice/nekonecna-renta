'use client';

import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
  error?: string;
  adornment?: ReactNode;
}

export default function InputField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  hint,
  error,
  adornment,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium text-white/60">
          {label}
        </Label>
        {adornment}
      </div>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className={`pr-12 bg-white/8 border-white/10 text-white placeholder:text-white/20 focus:border-lime-400/60 focus:ring-lime-400/30 focus:bg-white/12 transition-colors ${error ? 'border-red-400/60' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/30 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  );
}
