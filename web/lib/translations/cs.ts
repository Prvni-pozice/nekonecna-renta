import type { Dict } from './types';

function makeFmt(intlLocale: string, suffix: string) {
  return (n: number) => new Intl.NumberFormat(intlLocale).format(Math.round(n)) + ' ' + suffix;
}
function makeFmtNum(intlLocale: string) {
  return (n: number) => new Intl.NumberFormat(intlLocale).format(n);
}
function makeFmtShort(intlLocale: string) {
  return (value: number): string => {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toLocaleString(intlLocale, { maximumFractionDigits: 1 }) + ' mil';
    }
    if (value >= 1_000) {
      return (value / 1_000).toLocaleString(intlLocale, { maximumFractionDigits: 0 }) + ' tis';
    }
    return value.toLocaleString(intlLocale);
  };
}

const intlLocale = 'cs-CZ';
const currencySuffix = 'Kč';

const cs: Dict = {
  locale: 'cs',
  intlLocale,
  currencySuffix,
  fmt: makeFmt(intlLocale, currencySuffix),
  fmtNum: makeFmtNum(intlLocale),
  fmtShort: makeFmtShort(intlLocale),

  appTitle: 'Nekonečná renta',
  appSubtitle: 'Kolik si budeš moci vyplácet v důchodu?',
  disclaimer: 'Orientační výpočet. Nezohledňuje daně z výnosů. Nejedná se o investiční doporučení.',
  emptyState: 'Vyplň formulář pro zobrazení výsledků',
  perMonthLabel: '/měsíc',

  inputCurrentAge: 'Aktuální věk',
  inputRetirementAge: 'Věk do důchodu',
  inputRentaYears: 'Roky pobírání renty',
  inputMonthlyInvestment: 'Měsíční investice',
  inputAnnualRate: 'Roční zhodnocení',
  inputAnnualRateTooltip: 'Obvykle 4–10 % podle typu investic. Konzervativní portfolio ~4 %, vyvážené ~6 %, dynamické ~8–10 %. Nezohledňuje inflaci.',
  inputSuffixYears: 'let',

  inputInitialLumpSum: 'Jednorázový vklad na začátku',
  inputInitialLumpSumHint: 'Volitelné — částka, kterou vložíš hned při zahájení.',
  initialLumpSumToggle: 'Mám i jednorázový vklad',

  advancedToggleTitle: 'Pokročilý režim',
  advancedToggleHint: 'Inflace, růst vkladu v čase, výpočet potřebné částky pro cílovou rentu.',

  advancedAdjustmentTitle: 'Modelování hodnoty v čase',
  advancedAdjustmentHint: 'Zvol parametr, který hodnotu v čase „obrušuje". Předvyplňujeme českým průměrem za posledních 10 let — můžeš si ho upravit.',
  advancedParamInflation: 'Inflace',
  advancedParamWage: 'Růst průměrné mzdy',
  advancedParamRealEstate: 'Růst hodnoty nemovitostí',
  advancedParamHintInflation: 'Spotřebitelská inflace (CPI). Snižuje kupní sílu peněz.',
  advancedParamHintWage: 'Růst průměrné mzdy. Ukazuje, jak ti renta drží krok s mzdovou úrovní.',
  advancedParamHintRealEstate: 'Růst cen nemovitostí. Ukazuje, jak renta drží krok s cenou bydlení.',

  advancedEscalatorTitle: 'Roční nárůst měsíčního vkladu',
  advancedEscalatorHint: 'Reálně lidé v čase zvyšují investice s rostoucí mzdou. 0 % = plochý vklad po celou dobu spoření.',

  advancedModeTitle: 'Co počítat',
  advancedModeForward: 'Spočítat výslednou rentu',
  advancedModeGoalSeek: 'Spočítat potřebný vklad',
  advancedModeGoalSeekHint: 'Zadej, jakou rentu chceš v důchodu, a aplikace dopočítá, kolik měsíčně investovat.',
  inputTargetMonthlyRenta: 'Cílová měsíční renta',
  derivedMonthlyInvestmentLabel: 'Potřebný měsíční vklad',

  errorCurrentAge: 'Věk musí být 18–80 let.',
  errorRetirementAgeTooLow: 'Musí být větší než aktuální věk.',
  errorRetirementAgeTooHigh: 'Maximum je 85 let.',
  errorRentaYears: 'Počet let renty musí být 1–50.',
  errorMonthlyInvestment: 'Vklad musí být 0–10 000 000 Kč.',
  errorAnnualRate: 'Zhodnocení musí být 0–20 %.',
  errorInitialLumpSum: 'Jednorázový vklad musí být 0–100 000 000 Kč.',
  errorEscalator: 'Roční nárůst musí být 0–20 %.',
  errorAdjustmentRate: 'Sazba musí být 0–20 %.',
  errorTargetMonthlyRenta: 'Cílová renta musí být kladná hodnota.',

  fixedRentaTitle: (years) => `Renta na ${years} let`,
  fixedRentaSubtitle: (years) => `Po ${years} letech ti zůstane 0 Kč`,
  fixedRentaExtra: (fv) => `Naspořeno při důchodu: ${fv}`,
  infiniteRentaTitle: 'Nekonečná renta',
  infiniteRentaSubtitle: 'Vyplácíš jen výnosy, jistina zůstává nedotčená',
  realValueSubtitle: (amount) => `≈ ${amount} v dnešní hodnotě`,

  aboutTitle: 'O aplikaci',
  aboutDescription: 'Aplikaci Nekonečná renta jsme vytvořili, aby si každý mohl jednoduše spočítat, kolik potřebuje odkládat a kolik mu to jednou přinese.',
  aboutVisitWeb: 'Navštívit web 1P',
  aboutContactUs: 'Napsat nám o podobnou aplikaci',
  aboutCreatedBy: 'Vytvořila ',
  aboutFooter: (version) => `v${version} · Orientační výpočet, nejedná se o investiční doporučení.`,

  breakdownTitle: 'Jak jsme to spočítali',
  breakdownInputs: 'Vstupy',
  breakdownCurrentAge: 'Aktuální věk',
  breakdownRetirementAge: 'Věk odchodu do důchodu',
  breakdownRentaYears: 'Počet let renty',
  breakdownMonthlyInvestment: 'Měsíční vklad',
  breakdownAnnualRate: 'Roční zhodnocení',
  breakdownInitialLumpSum: 'Jednorázový vklad',
  breakdownEscalator: 'Roční nárůst vkladu',
  breakdownAdjustment: 'Modelování hodnoty',
  breakdownSavingsPhase: 'Fáze spoření',
  breakdownSavingsDuration: (years, months) => `${years} let = ${makeFmtNum(intlLocale)(months)} měsíců`,
  breakdownMonthlyRate: 'Měsíční úroková sazba',
  breakdownMonthlyRateNote: 'Převedeno z roční sazby přes (1+r)^(1/12)−1',
  breakdownTotalDeposited: 'Celkem vložíš ze svého',
  breakdownTotalInterest: 'Z toho výnos (úroky)',
  breakdownTotalSaved: 'Naspořeno celkem',
  breakdownMilestones: 'Orientační milníky spoření',
  breakdownTableAge: 'Věk',
  breakdownTableDeposited: 'Vloženo',
  breakdownTableValue: 'Hodnota',
  breakdownTableReturn: 'Výnos',
  breakdownWithdrawalPhase: 'Fáze výplaty renty',
  breakdownWithdrawalMonths: (months) => `${makeFmtNum(intlLocale)(months)} měsíců`,
  breakdownTotalPaidOut: 'Celkem vyplaceno',
  breakdownPrincipal: 'Z toho jistina',
  breakdownInterestDuringWithdrawal: 'Z toho úroky během čerpání',
  breakdownInfiniteTitle: 'Nekonečná renta',
  breakdownInfiniteExplanation: (fv) =>
    `Každý měsíc vybereš přesně tolik, kolik ti kapitál vydělal. Jistina ${fv} zůstává nedotčená a vydělává dál.`,
  breakdownRealValueTitle: 'Hodnota v dnešních penězích',
  breakdownRealValueExplanation: (paramLabel, rate) =>
    `Přepočteno přes „${paramLabel}" sazbou ${rate} % ročně. Ukazuje, jakou kupní sílu budou peníze mít vůči dnešku.`,
  breakdownFvReal: 'Naspořeno (v dnešních penězích)',
  breakdownRReal: 'Renta (v dnešních penězích)',
  breakdownRInfReal: 'Nekonečná renta (v dnešních penězích)',

  chartTitle: 'Vývoj kapitálu v čase',
  chartAge: 'věk',
  chartCapital: 'Kapitál',
  chartCapitalReal: 'V dnešní hodnotě',
  chartAgeLabel: (age) => `Věk ${age} let`,
  chartRetirement: 'Důchod',
  chartNote: (age) =>
    `Zelená plocha = nominální hodnota investic. Spořící fáze končí v ${age} letech, pak začíná výplata renty.`,
  chartLegendNominal: 'Nominální',
  chartLegendReal: 'V dnešní hodnotě',

  shareButton: 'Sdílet výsledky',
  shareCopied: 'Zkopírováno!',
  shareText: (currentAge, retirementAge, rentaYears, monthlyInvestment, annualRate, fv, R, R_inf) => {
    const fmt = makeFmt(intlLocale, currencySuffix);
    const years = retirementAge - currentAge;
    return [
      '📊 Moje výsledky z Nekonečné renty',
      '',
      '⚙️ Nastavení',
      `• Věk: ${currentAge} → ${retirementAge} let (${years} let spoření)`,
      `• Měsíční investice: ${fmt(monthlyInvestment)}`,
      `• Roční zhodnocení: ${annualRate} %`,
      '',
      `💰 Naspořený kapitál: ${fmt(fv)}`,
      '',
      '📈 Výsledky',
      `• Renta na ${rentaYears} let: ${fmt(R)} / měsíc`,
      `• Nekonečná renta: ${fmt(R_inf)} / měsíc`,
      '  (kapitál zůstane zachován)',
      '',
      'Spočítáno v aplikaci Nekonečná renta od První pozice',
      'www.prvni-pozice.com',
    ].join('\n');
  },
};

export default cs;
