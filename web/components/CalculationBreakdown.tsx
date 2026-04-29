'use client';

import { Breakdown } from '@/lib/calculations';
import { useDict } from '@/lib/dict-context';

interface Props {
  breakdown: Breakdown;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm font-medium text-white/75 text-right">{value}</span>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs bg-white/5 rounded-lg px-3 py-2 my-1 text-white/40 break-all border border-white/5">
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 pt-3">
      <h4 className="text-xs font-medium text-white/25 uppercase tracking-widest">{title}</h4>
      {children}
    </div>
  );
}

export default function CalculationBreakdown({ breakdown }: Props) {
  const dict = useDict();
  const fmt = dict.fmt;
  const fmtNum = dict.fmtNum;
  const {
    currentAge,
    retirementAge,
    rentaYears,
    monthlyInvestment,
    annualRate,
    initialLumpSum,
    incomeEscalator,
    valueAdjustment,
    savingsYears,
    nSpor,
    monthlyRate,
    totalDeposited,
    totalInterest,
    fv,
    milestones,
    nRenta,
    totalPaidOut,
    principalInRenta,
    interestInRenta,
    fvReal,
    R_real,
    R_inf_real,
  } = breakdown;

  const monthlyRatePct = (monthlyRate * 100).toFixed(4);

  const paramLabel = (() => {
    if (!valueAdjustment) return '';
    switch (valueAdjustment.parameter) {
      case 'inflation': return dict.advancedParamInflation;
      case 'wage': return dict.advancedParamWage;
      case 'realEstate': return dict.advancedParamRealEstate;
    }
  })();

  return (
    <details className="group">
      <summary className="cursor-pointer list-none flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 transition-colors select-none">
        <span className="text-sm font-medium text-white/50">{dict.breakdownTitle}</span>
        <span className="text-white/25 text-xs group-open:rotate-180 transition-transform inline-block">▼</span>
      </summary>

      <div className="mt-3 px-1 space-y-1">
        {/* Inputs */}
        <Section title={dict.breakdownInputs}>
          <Row label={dict.breakdownCurrentAge} value={`${currentAge} ${dict.inputSuffixYears}`} />
          <Row label={dict.breakdownRetirementAge} value={`${retirementAge} ${dict.inputSuffixYears}`} />
          <Row label={dict.breakdownRentaYears} value={`${rentaYears} ${dict.inputSuffixYears}`} />
          <Row label={dict.breakdownMonthlyInvestment} value={fmt(monthlyInvestment)} />
          <Row label={dict.breakdownAnnualRate} value={`${annualRate} %`} />
          {initialLumpSum > 0 && (
            <Row label={dict.breakdownInitialLumpSum} value={fmt(initialLumpSum)} />
          )}
          {incomeEscalator > 0 && (
            <Row label={dict.breakdownEscalator} value={`${incomeEscalator.toFixed(1)} %`} />
          )}
          {valueAdjustment && (
            <Row
              label={dict.breakdownAdjustment}
              value={`${paramLabel} · ${valueAdjustment.annualRate} %`}
            />
          )}
        </Section>

        {/* Savings phase */}
        <Section title={dict.breakdownSavingsPhase}>
          <Row label={dict.breakdownSavingsPhase} value={dict.breakdownSavingsDuration(savingsYears, nSpor)} />
          <Row label={dict.breakdownMonthlyRate} value={`${monthlyRatePct} %`} />
          <p className="text-xs text-white/25 italic pl-1">{dict.breakdownMonthlyRateNote}</p>
          <Row label={dict.breakdownTotalDeposited} value={fmt(totalDeposited)} />
          <Row label={dict.breakdownTotalInterest} value={fmt(totalInterest)} />
          <div className="flex justify-between items-baseline gap-4 py-1.5 bg-lime-400/10 rounded-lg px-2 mt-1 border border-lime-400/15">
            <span className="text-sm font-semibold text-white/60">{dict.breakdownTotalSaved}</span>
            <span className="text-sm font-bold text-lime-400">{fmt(fv)}</span>
          </div>
          <Formula>
            FV = PMT × (((1+i)^n − 1) / i)<br />
            FV = {fmtNum(monthlyInvestment)} × (((1+{monthlyRatePct}%)^{nSpor} − 1) / {monthlyRatePct}%) = {fmt(fv)}
          </Formula>
        </Section>

        {/* Reálná hodnota */}
        {valueAdjustment && fvReal !== undefined && (
          <Section title={dict.breakdownRealValueTitle}>
            <p className="text-xs text-white/35 leading-snug pb-1">
              {dict.breakdownRealValueExplanation(paramLabel, valueAdjustment.annualRate)}
            </p>
            <Row label={dict.breakdownFvReal} value={fmt(fvReal)} />
            {R_real !== undefined && (
              <Row label={dict.breakdownRReal} value={`${fmt(R_real)} ${dict.perMonthLabel}`} />
            )}
            {R_inf_real !== undefined && (
              <Row label={dict.breakdownRInfReal} value={`${fmt(R_inf_real)} ${dict.perMonthLabel}`} />
            )}
          </Section>
        )}

        {/* Milníky */}
        {milestones.length > 0 && (
          <Section title={dict.breakdownMilestones}>
            <div className="overflow-x-auto rounded-lg border border-white/8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-3 py-2 text-white/35 font-medium">{dict.breakdownTableAge}</th>
                    <th className="text-right px-3 py-2 text-white/35 font-medium">{dict.breakdownTableDeposited}</th>
                    <th className="text-right px-3 py-2 text-white/35 font-medium">{dict.breakdownTableValue}</th>
                    <th className="text-right px-3 py-2 text-white/35 font-medium">{dict.breakdownTableReturn}</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m) => (
                    <tr key={m.age} className="border-t border-white/5 hover:bg-white/4">
                      <td className="px-3 py-1.5 text-white/70 font-medium">{m.age}</td>
                      <td className="px-3 py-1.5 text-white/35 text-right">{fmt(m.totalDeposited)}</td>
                      <td className="px-3 py-1.5 text-white/70 text-right font-medium">{fmt(m.portfolioValue)}</td>
                      <td className="px-3 py-1.5 text-lime-400 text-right">+{fmt(m.gain)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Withdrawal phase */}
        <Section title={dict.breakdownWithdrawalPhase}>
          <Row label={dict.breakdownWithdrawalPhase} value={dict.breakdownWithdrawalMonths(nRenta)} />
          <Formula>
            R = FV × (i × (1+i)^n) / ((1+i)^n − 1)<br />
            R = {fmt(fv)} × ({monthlyRatePct}% × (1+{monthlyRatePct}%)^{nRenta}) / ((1+{monthlyRatePct}%)^{nRenta} − 1)
          </Formula>
          <Row label={dict.breakdownTotalPaidOut} value={fmt(totalPaidOut)} />
          <Row label={dict.breakdownPrincipal} value={fmt(principalInRenta)} />
          <Row label={dict.breakdownInterestDuringWithdrawal} value={fmt(interestInRenta)} />
        </Section>

        {/* Endless Annuity */}
        <Section title={dict.breakdownInfiniteTitle}>
          <Formula>
            R∞ = FV × i<br />
            R∞ = {fmt(fv)} × {monthlyRatePct} % = {fmt(Math.floor(fv * monthlyRate))} {dict.perMonthLabel}
          </Formula>
          <p className="text-sm text-white/35 pt-1 pb-2">
            {dict.breakdownInfiniteExplanation(fmt(fv))}
          </p>
        </Section>
      </div>
    </details>
  );
}
