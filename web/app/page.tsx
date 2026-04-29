'use client';

import { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import InputField from '@/components/InputField';
import ResultCard from '@/components/ResultCard';
import CapitalChart from '@/components/CapitalChart';
import CalculationBreakdown from '@/components/CalculationBreakdown';
import AboutSection from '@/components/AboutSection';
import ShareButton from '@/components/ShareButton';
import AdvancedSection, { AdvancedState } from '@/components/AdvancedSection';
import { calculate, VALUE_ADJUSTMENT_DEFAULTS } from '@/lib/calculations';
import { useDict } from '@/lib/dict-context';

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline text-gray-400 shrink-0">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
      <path d="M8 7v5M8 5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const dict = useDict();
  const [currentAge, setCurrentAge] = useState('30');
  const [retirementAge, setRetirementAge] = useState('60');
  const [rentaYears, setRentaYears] = useState('20');
  const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
  const [annualRate, setAnnualRate] = useState('6');

  const [lumpSumOpen, setLumpSumOpen] = useState(false);
  const [initialLumpSum, setInitialLumpSum] = useState('');

  const [advanced, setAdvanced] = useState<AdvancedState>({
    enabled: false,
    adjustmentEnabled: true,
    adjustmentParam: 'inflation',
    adjustmentRate: String(VALUE_ADJUSTMENT_DEFAULTS.inflation),
    escalator: '0',
    mode: 'forward',
    targetMonthlyRenta: '30000',
  });

  const parsed = useMemo(() => {
    const ca = parseInt(currentAge, 10);
    const ra = parseInt(retirementAge, 10);
    const ry = parseInt(rentaYears, 10);
    const mi = parseInt(monthlyInvestment, 10);
    const ar = parseFloat(annualRate);
    const lump = initialLumpSum.trim() === '' ? 0 : parseInt(initialLumpSum, 10);
    const adjRate = parseFloat(advanced.adjustmentRate);
    const esc = parseFloat(advanced.escalator);
    const target = parseInt(advanced.targetMonthlyRenta, 10);

    return {
      ca: isNaN(ca) ? null : ca,
      ra: isNaN(ra) ? null : ra,
      ry: isNaN(ry) ? null : ry,
      mi: isNaN(mi) ? null : mi,
      ar: isNaN(ar) ? null : ar,
      lump: isNaN(lump) ? null : lump,
      adjRate: isNaN(adjRate) ? null : adjRate,
      esc: isNaN(esc) ? null : esc,
      target: isNaN(target) ? null : target,
    };
  }, [
    currentAge,
    retirementAge,
    rentaYears,
    monthlyInvestment,
    annualRate,
    initialLumpSum,
    advanced.adjustmentRate,
    advanced.escalator,
    advanced.targetMonthlyRenta,
  ]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const { ca, ra, ry, mi, ar, lump, adjRate, esc, target } = parsed;

    if (ca !== null && (ca < 18 || ca > 80)) e.currentAge = dict.errorCurrentAge;
    if (ra !== null && ca !== null && ra <= ca) e.retirementAge = dict.errorRetirementAgeTooLow;
    if (ra !== null && ra > 85) e.retirementAge = dict.errorRetirementAgeTooHigh;
    if (ry !== null && (ry < 1 || ry > 50)) e.rentaYears = dict.errorRentaYears;

    // monthlyInvestment se kontroluje jen v 'forward' režimu
    const isGoalSeek = advanced.enabled && advanced.mode === 'goalSeek';
    if (!isGoalSeek && mi !== null && (mi < 0 || mi > 10_000_000)) {
      e.monthlyInvestment = dict.errorMonthlyInvestment;
    }
    if (ar !== null && (ar < 0 || ar > 20)) e.annualRate = dict.errorAnnualRate;
    if (lump !== null && (lump < 0 || lump > 100_000_000)) e.initialLumpSum = dict.errorInitialLumpSum;

    if (advanced.enabled) {
      if (adjRate !== null && (adjRate < 0 || adjRate > 20)) e.adjustmentRate = dict.errorAdjustmentRate;
      if (esc !== null && (esc < 0 || esc > 20)) e.escalator = dict.errorEscalator;
      if (advanced.mode === 'goalSeek' && (target === null || target <= 0 || target > 10_000_000)) {
        e.targetMonthlyRenta = dict.errorTargetMonthlyRenta;
      }
    }

    return e;
  }, [parsed, advanced.enabled, advanced.mode, dict]);

  const result = useMemo(() => {
    const { ca, ra, ry, mi, ar, lump, adjRate, esc, target } = parsed;
    if (
      ca === null || ra === null || ry === null || ar === null ||
      Object.keys(errors).length > 0 ||
      ca < 18 || ra <= ca || ra > 85 || ry < 1 || ar < 0
    ) {
      return null;
    }
    const isGoalSeek = advanced.enabled && advanced.mode === 'goalSeek';
    if (!isGoalSeek && (mi === null || mi < 0)) return null;
    if (isGoalSeek && (target === null || target <= 0)) return null;

    return calculate({
      currentAge: ca,
      retirementAge: ra,
      rentaYears: ry,
      monthlyInvestment: mi ?? 0,
      annualReturnRate: ar,
      initialLumpSum: lump ?? 0,
      advanced: advanced.enabled,
      valueAdjustment: advanced.enabled
        ? { parameter: advanced.adjustmentParam, annualRate: adjRate ?? 0 }
        : undefined,
      incomeEscalator: advanced.enabled ? esc ?? 0 : 0,
      mode: isGoalSeek ? 'goalSeek' : 'forward',
      targetMonthlyRenta: isGoalSeek ? target ?? 0 : undefined,
    });
  }, [parsed, errors, advanced]);

  const isGoalSeek = advanced.enabled && advanced.mode === 'goalSeek';
  const hasRealValue = !!(advanced.enabled && result?.fvReal !== undefined);

  return (
    <main className="min-h-screen bg-[oklch(0.1_0.02_265)] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-lime-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[100px]" />

      <div className="relative max-w-xl mx-auto px-4 py-12 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center pb-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
            {dict.appTitle}
          </h1>
          <p className="text-white/40 text-sm font-light tracking-wide">
            {dict.appSubtitle}
          </p>
        </div>

        {/* Formulář */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-5 shadow-xl shadow-black/30">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="currentAge"
              label={dict.inputCurrentAge}
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={80}
              suffix={dict.inputSuffixYears}
              error={errors.currentAge}
            />
            <InputField
              id="retirementAge"
              label={dict.inputRetirementAge}
              value={retirementAge}
              onChange={setRetirementAge}
              min={19}
              max={85}
              suffix={dict.inputSuffixYears}
              error={errors.retirementAge}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="rentaYears"
              label={dict.inputRentaYears}
              value={rentaYears}
              onChange={setRentaYears}
              min={1}
              max={50}
              suffix={dict.inputSuffixYears}
              error={errors.rentaYears}
            />
            {isGoalSeek ? (
              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-white/40">
                  {dict.derivedMonthlyInvestmentLabel}
                </span>
                <div className="rounded-md bg-amber-400/10 border border-amber-400/30 px-3 py-2 text-amber-100 font-semibold text-base">
                  {result?.derivedMonthlyInvestment !== undefined
                    ? dict.fmt(result.derivedMonthlyInvestment)
                    : '—'}
                </div>
              </div>
            ) : (
              <InputField
                id="monthlyInvestment"
                label={dict.inputMonthlyInvestment}
                value={monthlyInvestment}
                onChange={setMonthlyInvestment}
                min={0}
                max={10_000_000}
                sliderMax={100_000}
                step={500}
                suffix={dict.currencySuffix}
                error={errors.monthlyInvestment}
              />
            )}
          </div>

          {/* Jednorázový vklad — collapsible */}
          <Collapsible open={lumpSumOpen} onOpenChange={setLumpSumOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs text-white/45 hover:text-white/75 transition-colors">
              <span className={`transition-transform inline-block ${lumpSumOpen ? 'rotate-90' : ''}`}>▸</span>
              {dict.initialLumpSumToggle}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <InputField
                id="initialLumpSum"
                label={dict.inputInitialLumpSum}
                value={initialLumpSum}
                onChange={setInitialLumpSum}
                min={0}
                max={100_000_000}
                step={10_000}
                suffix={dict.currencySuffix}
                hint={dict.inputInitialLumpSumHint}
                error={errors.initialLumpSum}
              />
            </CollapsibleContent>
          </Collapsible>

          <InputField
            id="annualRate"
            label={dict.inputAnnualRate}
            value={annualRate}
            onChange={setAnnualRate}
            min={0}
            max={20}
            step={0.1}
            suffix="%"
            error={errors.annualRate}
            adornment={
              <Tooltip>
                <TooltipTrigger className="focus:outline-none" aria-label={dict.inputAnnualRate}>
                  <InfoIcon />
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-xs leading-relaxed">
                  {dict.inputAnnualRateTooltip}
                </TooltipContent>
              </Tooltip>
            }
          />

          {/* Pokročilý režim */}
          <div className="pt-2 border-t border-white/8">
            <AdvancedSection state={advanced} onChange={setAdvanced} errors={errors} />
          </div>
        </div>

        {/* Výsledky */}
        {result ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <ResultCard
                title={dict.fixedRentaTitle(parsed.ry!)}
                amount={result.R}
                subtitle={dict.fixedRentaSubtitle(parsed.ry!)}
                extra={dict.fixedRentaExtra(dict.fmt(result.fv))}
                realAmount={hasRealValue ? result.R_real : undefined}
              />
              <ResultCard
                title={dict.infiniteRentaTitle}
                amount={result.R_inf}
                subtitle={dict.infiniteRentaSubtitle}
                realAmount={hasRealValue ? result.R_inf_real : undefined}
              />
            </div>

            <p className="text-xs text-white/25 text-center px-2 -mt-2">
              {dict.disclaimer}
            </p>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
              <CapitalChart
                chartData={result.chartData}
                retirementAge={parsed.ra!}
                fv={result.fv}
                rentaYears={parsed.ry!}
                hasRealValue={hasRealValue}
              />
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
              <CalculationBreakdown breakdown={result.breakdown} />
            </div>

            <ShareButton result={result} />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/25 text-sm tracking-wide">
            {dict.emptyState}
          </div>
        )}

        <AboutSection />
      </div>
    </main>
  );
}
