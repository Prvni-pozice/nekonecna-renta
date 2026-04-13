'use client';

import { useState } from 'react';
import { CalculationResult } from '@/lib/calculations';
import { useDict } from '@/lib/dict-context';

export default function ShareButton({ result }: { result: CalculationResult }) {
  const dict = useDict();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const b = result.breakdown;
    const text = dict.shareText(
      b.currentAge, b.retirementAge, b.rentaYears,
      b.monthlyInvestment, b.annualRate, b.fv,
      result.R, result.R_inf
    );

    if (navigator.share) {
      try {
        await navigator.share({ title: dict.appTitle, text });
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
      {copied ? dict.shareCopied : dict.shareButton}
    </button>
  );
}
