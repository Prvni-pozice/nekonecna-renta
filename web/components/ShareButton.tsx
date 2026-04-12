'use client';

import { useState } from 'react';
import { CalculationResult } from '@/lib/calculations';

function fmtKc(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(n) + ' Kč';
}

function buildShareText(result: CalculationResult): string {
  const b = result.breakdown;
  const years = b.retirementAge - b.currentAge;

  return `📊 Moje výsledky z Nekonečné renty

⚙️ Nastavení
• Věk: ${b.currentAge} → ${b.retirementAge} let (${years} let spoření)
• Měsíční investice: ${fmtKc(b.monthlyInvestment)}
• Roční zhodnocení: ${b.annualRate} %

💰 Naspořený kapitál: ${fmtKc(b.fv)}

📈 Výsledky
• Renta na ${b.rentaYears} let: ${fmtKc(result.R)} / měsíc
• Nekonečná renta: ${fmtKc(result.R_inf)} / měsíc
  (kapitál zůstane zachován)

Spočítáno v aplikaci Nekonečná renta od První pozice
www.prvni-pozice.com`;
}

export default function ShareButton({ result }: { result: CalculationResult }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = buildShareText(result);

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Nekonečná renta', text });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 active:bg-lime-500 text-black font-semibold rounded-2xl py-3.5 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      {copied ? 'Zkopírováno!' : 'Sdílet výsledky'}
    </button>
  );
}
