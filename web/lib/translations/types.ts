export interface Dict {
  locale: 'cs' | 'en'
  intlLocale: string
  currencySuffix: string
  fmt: (n: number) => string
  fmtNum: (n: number) => string
  fmtShort: (n: number) => string

  appTitle: string
  appSubtitle: string
  disclaimer: string
  emptyState: string

  inputCurrentAge: string
  inputRetirementAge: string
  inputRentaYears: string
  inputMonthlyInvestment: string
  inputAnnualRate: string
  inputAnnualRateTooltip: string
  inputSuffixYears: string

  errorCurrentAge: string
  errorRetirementAgeTooLow: string
  errorRetirementAgeTooHigh: string
  errorRentaYears: string
  errorMonthlyInvestment: string
  errorAnnualRate: string

  fixedRentaTitle: (years: number) => string
  fixedRentaSubtitle: (years: number) => string
  fixedRentaExtra: (fv: string) => string
  infiniteRentaTitle: string
  infiniteRentaSubtitle: string

  aboutTitle: string
  aboutDescription: string
  aboutVisitWeb: string
  aboutContactUs: string
  aboutCreatedBy: string
  aboutFooter: (version: string) => string

  breakdownTitle: string
  breakdownInputs: string
  breakdownCurrentAge: string
  breakdownRetirementAge: string
  breakdownRentaYears: string
  breakdownMonthlyInvestment: string
  breakdownAnnualRate: string
  breakdownSavingsPhase: string
  breakdownSavingsDuration: (years: number, months: number) => string
  breakdownMonthlyRate: string
  breakdownMonthlyRateNote: string
  breakdownTotalDeposited: string
  breakdownTotalInterest: string
  breakdownTotalSaved: string
  breakdownMilestones: string
  breakdownTableAge: string
  breakdownTableDeposited: string
  breakdownTableValue: string
  breakdownTableReturn: string
  breakdownWithdrawalPhase: string
  breakdownWithdrawalMonths: (months: number) => string
  breakdownTotalPaidOut: string
  breakdownPrincipal: string
  breakdownInterestDuringWithdrawal: string
  breakdownInfiniteTitle: string
  breakdownInfiniteExplanation: (fv: string) => string

  chartTitle: string
  chartAge: string
  chartCapital: string
  chartAgeLabel: (age: number) => string
  chartRetirement: string
  chartNote: (age: number) => string

  shareButton: string
  shareCopied: string
  shareText: (
    currentAge: number,
    retirementAge: number,
    rentaYears: number,
    monthlyInvestment: number,
    annualRate: number,
    fv: number,
    R: number,
    R_inf: number
  ) => string
}
