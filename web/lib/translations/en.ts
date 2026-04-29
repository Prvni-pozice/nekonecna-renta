import type { Dict } from './types';

const eurFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function makeFmt() {
  return (n: number) => eurFmt.format(Math.round(n));
}
function makeFmtNum(intlLocale: string) {
  return (n: number) => new Intl.NumberFormat(intlLocale).format(n);
}
function makeFmtShort(intlLocale: string) {
  return (value: number): string => {
    if (value >= 1_000_000) {
      return '€' + (value / 1_000_000).toLocaleString(intlLocale, { maximumFractionDigits: 1 }) + 'M';
    }
    if (value >= 1_000) {
      return '€' + (value / 1_000).toLocaleString(intlLocale, { maximumFractionDigits: 0 }) + 'K';
    }
    return '€' + value.toLocaleString(intlLocale);
  };
}

const intlLocale = 'en-GB';
const currencySuffix = '€';

const en: Dict = {
  locale: 'en',
  intlLocale,
  currencySuffix,
  fmt: makeFmt(),
  fmtNum: makeFmtNum(intlLocale),
  fmtShort: makeFmtShort(intlLocale),

  appTitle: 'Endless Annuity',
  appSubtitle: 'How much will you be able to withdraw in retirement?',
  disclaimer: 'Indicative calculation. Does not account for investment taxes. Not investment advice.',
  emptyState: 'Fill in the form to see your results',
  perMonthLabel: '/month',

  inputCurrentAge: 'Current age',
  inputRetirementAge: 'Retirement age',
  inputRentaYears: 'Annuity years',
  inputMonthlyInvestment: 'Monthly investment',
  inputAnnualRate: 'Annual return',
  inputAnnualRateTooltip: 'Usually 4–10% depending on investment type. Conservative portfolio ~4%, balanced ~6%, aggressive ~8–10%. Excludes inflation.',
  inputSuffixYears: 'yrs',

  inputInitialLumpSum: 'Initial lump sum',
  inputInitialLumpSumHint: 'Optional — the amount you invest upfront, right at the start.',
  initialLumpSumToggle: 'I also have an initial lump sum',

  advancedToggleTitle: 'Advanced mode',
  advancedToggleHint: 'Inflation, contribution growth over time, calculation of the deposit needed for a target annuity.',

  advancedAdjustmentTitle: 'Modelling value over time',
  advancedAdjustmentHint: 'Pick a parameter that erodes value over time. We pre-fill the recent long-term Czech average — feel free to adjust it.',
  advancedParamInflation: 'Inflation',
  advancedParamWage: 'Average wage growth',
  advancedParamRealEstate: 'Real-estate value growth',
  advancedParamHintInflation: 'Consumer price inflation (CPI). Reduces the purchasing power of money.',
  advancedParamHintWage: 'Growth of average wages. Shows how the annuity keeps up with wage levels.',
  advancedParamHintRealEstate: 'Growth of property prices. Shows how the annuity keeps up with the cost of housing.',

  advancedEscalatorTitle: 'Annual increase of monthly investment',
  advancedEscalatorHint: 'In real life people raise contributions as their wages grow. 0% = flat investment for the entire saving period.',

  advancedModeTitle: 'What to compute',
  advancedModeForward: 'Compute the resulting annuity',
  advancedModeGoalSeek: 'Compute the required deposit',
  advancedModeGoalSeekHint: 'Enter the annuity you want in retirement and the app will work out how much to invest each month.',
  inputTargetMonthlyRenta: 'Target monthly annuity',
  derivedMonthlyInvestmentLabel: 'Required monthly deposit',

  errorCurrentAge: 'Age must be 18–80.',
  errorRetirementAgeTooLow: 'Must be greater than current age.',
  errorRetirementAgeTooHigh: 'Maximum is 85 years.',
  errorRentaYears: 'Annuity years must be 1–50.',
  errorMonthlyInvestment: 'Investment must be 0–€10,000,000.',
  errorAnnualRate: 'Return must be 0–20%.',
  errorInitialLumpSum: 'Lump sum must be 0–€100,000,000.',
  errorEscalator: 'Annual increase must be 0–20%.',
  errorAdjustmentRate: 'Rate must be 0–20%.',
  errorTargetMonthlyRenta: 'Target annuity must be a positive value.',

  fixedRentaTitle: (years) => `Annuity for ${years} years`,
  fixedRentaSubtitle: (years) => `After ${years} years, €0 remains`,
  fixedRentaExtra: (fv) => `Saved at retirement: ${fv}`,
  infiniteRentaTitle: 'Endless Annuity',
  infiniteRentaSubtitle: 'You pay out only returns, principal stays intact',
  realValueSubtitle: (amount) => `≈ ${amount} in today's value`,

  aboutTitle: 'About the app',
  aboutDescription: 'We created the Endless Annuity app so everyone can easily calculate how much they need to save and how much it will bring them.',
  aboutVisitWeb: 'Visit 1P website',
  aboutContactUs: 'Write to us about a similar app',
  aboutCreatedBy: 'Created by ',
  aboutFooter: (version) => `v${version} · Indicative calculation, not investment advice.`,

  breakdownTitle: 'How we calculated it',
  breakdownInputs: 'Inputs',
  breakdownCurrentAge: 'Current age',
  breakdownRetirementAge: 'Retirement age',
  breakdownRentaYears: 'Annuity years',
  breakdownMonthlyInvestment: 'Monthly investment',
  breakdownAnnualRate: 'Annual return',
  breakdownInitialLumpSum: 'Initial lump sum',
  breakdownEscalator: 'Annual contribution increase',
  breakdownAdjustment: 'Value modelling',
  breakdownSavingsPhase: 'Savings phase',
  breakdownSavingsDuration: (years, months) => `${years} years = ${makeFmtNum(intlLocale)(months)} months`,
  breakdownMonthlyRate: 'Monthly interest rate',
  breakdownMonthlyRateNote: 'Converted from annual rate via (1+r)^(1/12)−1',
  breakdownTotalDeposited: 'Total you will deposit',
  breakdownTotalInterest: 'Of which returns (interest)',
  breakdownTotalSaved: 'Total saved',
  breakdownMilestones: 'Indicative savings milestones',
  breakdownTableAge: 'Age',
  breakdownTableDeposited: 'Deposited',
  breakdownTableValue: 'Value',
  breakdownTableReturn: 'Return',
  breakdownWithdrawalPhase: 'Annuity payout phase',
  breakdownWithdrawalMonths: (months) => `${makeFmtNum(intlLocale)(months)} months`,
  breakdownTotalPaidOut: 'Total paid out',
  breakdownPrincipal: 'Of which principal',
  breakdownInterestDuringWithdrawal: 'Of which interest during withdrawal',
  breakdownInfiniteTitle: 'Endless Annuity',
  breakdownInfiniteExplanation: (fv) =>
    `Each month you withdraw exactly as much as the capital earns. The principal ${fv} remains intact and keeps earning.`,
  breakdownRealValueTitle: 'Value in today\u2019s money',
  breakdownRealValueExplanation: (paramLabel, rate) =>
    `Adjusted using "${paramLabel}" at ${rate}% per year. Shows the purchasing power relative to today.`,
  breakdownFvReal: 'Saved (in today\u2019s money)',
  breakdownRReal: 'Annuity (in today\u2019s money)',
  breakdownRInfReal: 'Endless annuity (in today\u2019s money)',

  chartTitle: 'Capital development over time',
  chartAge: 'age',
  chartCapital: 'Capital',
  chartCapitalReal: 'In today\u2019s value',
  chartAgeLabel: (age) => `Age ${age}`,
  chartRetirement: 'Retirement',
  chartNote: (age) =>
    `Green area = nominal value of your investments. Savings phase ends at age ${age}, then annuity payouts begin.`,
  chartLegendNominal: 'Nominal',
  chartLegendReal: 'In today\u2019s value',

  shareButton: 'Share results',
  shareCopied: 'Copied!',
  shareText: (currentAge, retirementAge, rentaYears, monthlyInvestment, annualRate, fv, R, R_inf) => {
    const fmt = makeFmt();
    const years = retirementAge - currentAge;
    return [
      '📊 My results from Endless Annuity',
      '',
      '⚙️ Settings',
      `• Age: ${currentAge} → ${retirementAge} (${years} years of saving)`,
      `• Monthly investment: ${fmt(monthlyInvestment)}`,
      `• Annual return: ${annualRate}%`,
      '',
      `💰 Saved capital: ${fmt(fv)}`,
      '',
      '📈 Results',
      `• Annuity for ${rentaYears} years: ${fmt(R)} / month`,
      `• Endless annuity: ${fmt(R_inf)} / month`,
      '  (capital preserved)',
      '',
      'Calculated with the Endless Annuity app by První pozice',
      'www.prvni-pozice.com',
    ].join('\n');
  },
};

export default en;
