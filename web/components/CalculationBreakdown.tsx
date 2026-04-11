'use client';

import { Breakdown } from '@/lib/calculations';

interface Props {
  breakdown: Breakdown;
}

function fmt(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(n) + ' Kč';
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(n);
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
  const {
    currentAge,
    retirementAge,
    rentaYears,
    monthlyInvestment,
    annualRate,
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
    infFormulaDecomposed,
  } = breakdown;

  const monthlyRatePct = (monthlyRate * 100).toFixed(4);

  return (
    <details className="group">
      <summary className="cursor-pointer list-none flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 transition-colors select-none">
        <span className="text-sm font-medium text-white/50">Jak jsme to spočítali</span>
        <span className="text-white/25 text-xs group-open:rotate-180 transition-transform inline-block">▼</span>
      </summary>

      <div className="mt-3 px-1 space-y-1">
        {/* Vstupy */}
        <Section title="Vstupy">
          <Row label="Aktuální věk" value={`${currentAge} let`} />
          <Row label="Věk odchodu do důchodu" value={`${retirementAge} let`} />
          <Row label="Počet let renty" value={`${rentaYears} let`} />
          <Row label="Měsíční vklad" value={fmt(monthlyInvestment)} />
          <Row label="Roční zhodnocení" value={`${annualRate} %`} />
        </Section>

        {/* Fáze spoření */}
        <Section title="Fáze spoření">
          <Row label="Doba spoření" value={`${savingsYears} let = ${fmtNum(nSpor)} měsíců`} />
          <Row label="Měsíční úroková sazba" value={`${monthlyRatePct} %`} />
          <p className="text-xs text-white/25 italic pl-1">Převedeno z roční sazby přes (1+r)^(1/12)−1</p>
          <Row label="Celkem vložíš ze svého" value={fmt(totalDeposited)} />
          <Row label="Z toho výnos (úroky)" value={fmt(totalInterest)} />
          <div className="flex justify-between items-baseline gap-4 py-1.5 bg-lime-400/10 rounded-lg px-2 mt-1 border border-lime-400/15">
            <span className="text-sm font-semibold text-white/60">Naspořeno celkem</span>
            <span className="text-sm font-bold text-lime-400">{fmt(fv)}</span>
          </div>
          <Formula>
            FV = PMT × (((1+i)^n − 1) / i)<br />
            FV = {fmtNum(monthlyInvestment)} × (((1+{monthlyRatePct}%)^{nSpor} − 1) / {monthlyRatePct}%) = {fmt(fv)}
          </Formula>
        </Section>

        {/* Milníky */}
        {milestones.length > 0 && (
          <Section title="Orientační milníky spoření">
            <div className="overflow-x-auto rounded-lg border border-white/8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-3 py-2 text-white/35 font-medium">Věk</th>
                    <th className="text-right px-3 py-2 text-white/35 font-medium">Vloženo</th>
                    <th className="text-right px-3 py-2 text-white/35 font-medium">Hodnota</th>
                    <th className="text-right px-3 py-2 text-white/35 font-medium">Výnos</th>
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

        {/* Fáze výplaty */}
        <Section title="Fáze výplaty renty">
          <Row label="Počet měsíců čerpání" value={`${fmtNum(nRenta)} měsíců`} />
          <Formula>
            R = FV × (i × (1+i)^n) / ((1+i)^n − 1)<br />
            R = {fmt(fv)} × ({monthlyRatePct}% × (1+{monthlyRatePct}%)^{nRenta}) / ((1+{monthlyRatePct}%)^{nRenta} − 1)
          </Formula>
          <Row label="Celkem vyplaceno" value={fmt(totalPaidOut)} />
          <Row label="Z toho jistina" value={fmt(principalInRenta)} />
          <Row label="Z toho úroky během čerpání" value={fmt(interestInRenta)} />
        </Section>

        {/* Nekonečná renta */}
        <Section title="Nekonečná renta">
          <Formula>
            R∞ = FV × i<br />
            {infFormulaDecomposed}
          </Formula>
          <p className="text-sm text-white/35 pt-1 pb-2">
            Každý měsíc vybereš přesně tolik, kolik ti kapitál vydělal.
            Jistina <span className="font-medium text-white/60">{fmt(fv)}</span> zůstává nedotčená a vydělává dál.
          </p>
        </Section>
      </div>
    </details>
  );
}
