'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import InputField from '@/components/InputField';
import { useDict } from '@/lib/dict-context';
import {
  VALUE_ADJUSTMENT_DEFAULTS,
  ValueAdjustmentParam,
} from '@/lib/calculations';

export interface AdvancedState {
  enabled: boolean;
  adjustmentEnabled: boolean;
  adjustmentParam: ValueAdjustmentParam;
  adjustmentRate: string;
  escalator: string;
  mode: 'forward' | 'goalSeek';
  targetMonthlyRenta: string;
}

interface AdvancedSectionProps {
  state: AdvancedState;
  onChange: (next: AdvancedState) => void;
  errors: Record<string, string>;
}

export default function AdvancedSection({ state, onChange, errors }: AdvancedSectionProps) {
  const dict = useDict();
  const set = <K extends keyof AdvancedState>(key: K, value: AdvancedState[K]) =>
    onChange({ ...state, [key]: value });

  const paramHints: Record<ValueAdjustmentParam, string> = {
    inflation: dict.advancedParamHintInflation,
    wage: dict.advancedParamHintWage,
    realEstate: dict.advancedParamHintRealEstate,
  };
  const paramLabels: Record<ValueAdjustmentParam, string> = {
    inflation: dict.advancedParamInflation,
    wage: dict.advancedParamWage,
    realEstate: dict.advancedParamRealEstate,
  };

  const onParamChange = (p: ValueAdjustmentParam) => {
    onChange({
      ...state,
      adjustmentParam: p,
      adjustmentRate: String(VALUE_ADJUSTMENT_DEFAULTS[p]),
    });
  };

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <Switch
          checked={state.enabled}
          onCheckedChange={(v) => set('enabled', v)}
          className="mt-0.5 shrink-0 data-[state=checked]:bg-lime-400 data-[state=unchecked]:bg-white/15"
        />
        <span className="space-y-0.5">
          <span className="block text-sm font-medium text-white/70">
            {dict.advancedToggleTitle}
          </span>
          <span className="block text-xs text-white/35 leading-snug">
            {dict.advancedToggleHint}
          </span>
        </span>
      </label>

      {state.enabled && (
        <div className="space-y-5 border-l-2 border-amber-400/30 pl-4 ml-1">
          {/* === Goal-seek mode switch === */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/60 uppercase tracking-widest">
              {dict.advancedModeTitle}
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
              {(['forward', 'goalSeek'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('mode', m)}
                  className={`text-xs px-2 py-2 rounded-lg transition-colors ${
                    state.mode === m
                      ? 'bg-lime-400/20 text-lime-100 font-medium'
                      : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  {m === 'forward' ? dict.advancedModeForward : dict.advancedModeGoalSeek}
                </button>
              ))}
            </div>
            {state.mode === 'goalSeek' && (
              <>
                <p className="text-xs text-white/35 leading-snug">
                  {dict.advancedModeGoalSeekHint}
                </p>
                <InputField
                  id="targetMonthlyRenta"
                  label={dict.inputTargetMonthlyRenta}
                  value={state.targetMonthlyRenta}
                  onChange={(v) => set('targetMonthlyRenta', v)}
                  min={0}
                  max={10_000_000}
                  sliderMax={200_000}
                  step={1000}
                  suffix={dict.currencySuffix}
                  error={errors.targetMonthlyRenta}
                />
              </>
            )}
          </div>

          {/* === Value adjustment === */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/60 uppercase tracking-widest">
              {dict.advancedAdjustmentTitle}
            </p>
            <p className="text-xs text-white/35 leading-snug">
              {dict.advancedAdjustmentHint}
            </p>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
              {(Object.keys(VALUE_ADJUSTMENT_DEFAULTS) as ValueAdjustmentParam[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onParamChange(p)}
                  className={`text-xs px-2 py-2 rounded-lg transition-colors ${
                    state.adjustmentParam === p
                      ? 'bg-amber-400/20 text-amber-100 font-medium'
                      : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  {paramLabels[p]}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/30 italic">
              {paramHints[state.adjustmentParam]}
            </p>
            <InputField
              id="adjustmentRate"
              label={paramLabels[state.adjustmentParam]}
              value={state.adjustmentRate}
              onChange={(v) => set('adjustmentRate', v)}
              min={0}
              max={20}
              step={0.1}
              suffix="%"
              error={errors.adjustmentRate}
            />
          </div>

          {/* === Escalator === */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/60 uppercase tracking-widest">
              {dict.advancedEscalatorTitle}
            </p>
            <p className="text-xs text-white/35 leading-snug">
              {dict.advancedEscalatorHint}
            </p>
            <InputField
              id="escalator"
              label={dict.advancedEscalatorTitle}
              value={state.escalator}
              onChange={(v) => set('escalator', v)}
              min={0}
              max={20}
              step={0.1}
              suffix="%"
              error={errors.escalator}
            />
          </div>
        </div>
      )}
    </div>
  );
}
