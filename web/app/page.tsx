'use client';

import { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import InputField from '@/components/InputField';
import ResultCard from '@/components/ResultCard';
import CapitalChart from '@/components/CapitalChart';
import CalculationBreakdown from '@/components/CalculationBreakdown';
import AboutSection from '@/components/AboutSection';
import { calculate } from '@/lib/calculations';

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline text-gray-400 shrink-0">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
      <path d="M8 7v5M8 5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function fmt(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(n) + ' Kč';
}

export default function Home() {
  const [currentAge, setCurrentAge] = useState('30');
  const [retirementAge, setRetirementAge] = useState('60');
  const [rentaYears, setRentaYears] = useState('20');
  const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
  const [annualRate, setAnnualRate] = useState('6');

  const parsed = useMemo(() => {
    const ca = parseInt(currentAge, 10);
    const ra = parseInt(retirementAge, 10);
    const ry = parseInt(rentaYears, 10);
    const mi = parseInt(monthlyInvestment, 10);
    const ar = parseFloat(annualRate);

    return {
      ca: isNaN(ca) ? null : ca,
      ra: isNaN(ra) ? null : ra,
      ry: isNaN(ry) ? null : ry,
      mi: isNaN(mi) ? null : mi,
      ar: isNaN(ar) ? null : ar,
    };
  }, [currentAge, retirementAge, rentaYears, monthlyInvestment, annualRate]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const { ca, ra, ry, mi, ar } = parsed;

    if (ca !== null && (ca < 18 || ca > 80)) e.currentAge = 'Věk musí být 18–80 let.';
    if (ra !== null && ca !== null && ra <= ca) e.retirementAge = 'Musí být větší než aktuální věk.';
    if (ra !== null && ra > 85) e.retirementAge = 'Maximum je 85 let.';
    if (ry !== null && (ry < 1 || ry > 50)) e.rentaYears = 'Počet let renty musí být 1–50.';
    if (mi !== null && (mi < 0 || mi > 1_000_000)) e.monthlyInvestment = 'Vklad musí být 0–1 000 000 Kč.';
    if (ar !== null && (ar < 0 || ar > 20)) e.annualRate = 'Zhodnocení musí být 0–20 %.';

    return e;
  }, [parsed]);

  const result = useMemo(() => {
    const { ca, ra, ry, mi, ar } = parsed;
    if (
      ca === null || ra === null || ry === null || mi === null || ar === null ||
      Object.keys(errors).length > 0 ||
      ca < 18 || ra <= ca || ra > 85 || ry < 1 || mi < 0 || ar < 0
    ) {
      return null;
    }
    return calculate({
      currentAge: ca,
      retirementAge: ra,
      rentaYears: ry,
      monthlyInvestment: mi,
      annualReturnRate: ar,
    });
  }, [parsed, errors]);

  return (
    <main className="min-h-screen bg-[oklch(0.1_0.02_265)] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-lime-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[100px]" />

      <div className="relative max-w-xl mx-auto px-4 py-12 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center pb-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
            Nekonečná renta
          </h1>
          <p className="text-white/40 text-sm font-light tracking-wide">
            Kolik si budeš moci vyplácet v důchodu?
          </p>
        </div>

        {/* Formulář */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-5 shadow-xl shadow-black/30">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="currentAge"
              label="Aktuální věk"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={80}
              suffix="let"
              error={errors.currentAge}
            />
            <InputField
              id="retirementAge"
              label="Věk do důchodu"
              value={retirementAge}
              onChange={setRetirementAge}
              min={19}
              max={85}
              suffix="let"
              error={errors.retirementAge}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="rentaYears"
              label="Roky pobírání renty"
              value={rentaYears}
              onChange={setRentaYears}
              min={1}
              max={50}
              suffix="let"
              error={errors.rentaYears}
            />
            <InputField
              id="monthlyInvestment"
              label="Měsíční investice"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={0}
              max={1_000_000}
              step={500}
              suffix="Kč"
              error={errors.monthlyInvestment}
            />
          </div>
          <InputField
            id="annualRate"
            label="Roční zhodnocení"
            value={annualRate}
            onChange={setAnnualRate}
            min={0}
            max={20}
            step={0.1}
            suffix="%"
            error={errors.annualRate}
            adornment={
              <Tooltip>
                <TooltipTrigger className="focus:outline-none" aria-label="Nápověda ke zhodnocení">
                  <InfoIcon />
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-xs leading-relaxed">
                  Obvykle 4–10 % podle typu investic. Konzervativní portfolio ~4 %, vyvážené ~6 %, dynamické ~8–10 %. Nezohledňuje inflaci.
                </TooltipContent>
              </Tooltip>
            }
          />
        </div>

        {/* Výsledky */}
        {result ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <ResultCard
                title={`Renta na ${parsed.ry} let`}
                amount={result.R}
                subtitle={`Po ${parsed.ry} letech ti zůstane 0 Kč`}
                extra={`Naspořeno při důchodu: ${fmt(result.fv)}`}
              />
              <ResultCard
                title="Nekonečná renta"
                amount={result.R_inf}
                subtitle="Vyplácíš jen výnosy, jistina zůstává nedotčená"
              />
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-white/25 text-center px-2 -mt-2">
              Orientační výpočet. Nezohledňuje inflaci ani daně z výnosů. Nejedná se o investiční doporučení.
            </p>

            {/* Graf */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
              <CapitalChart
                chartData={result.chartData}
                retirementAge={parsed.ra!}
                fv={result.fv}
                rentaYears={parsed.ry!}
              />
            </div>

            {/* Rozpis výpočtu */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
              <CalculationBreakdown breakdown={result.breakdown} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/25 text-sm tracking-wide">
            Vyplň formulář pro zobrazení výsledků
          </div>
        )}

        {/* O aplikaci + footer – vždy viditelné */}
        <AboutSection />
      </div>
    </main>
  );
}
