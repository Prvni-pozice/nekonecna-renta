// Defaults for advanced mode (CZ-friendly long-term averages)
export const VALUE_ADJUSTMENT_DEFAULTS = {
  inflation: 3.5,
  wage: 5.0,
  realEstate: 6.0,
} as const;

export type ValueAdjustmentParam = keyof typeof VALUE_ADJUSTMENT_DEFAULTS;

export interface ValueAdjustment {
  parameter: ValueAdjustmentParam;
  annualRate: number; // percent
}

export type CalcMode = 'forward' | 'goalSeek';

export interface CalculationInputs {
  currentAge: number;
  retirementAge: number;
  rentaYears: number;
  monthlyInvestment: number;
  annualReturnRate: number; // percent
  // optional / advanced
  initialLumpSum?: number;
  advanced?: boolean;
  valueAdjustment?: ValueAdjustment;
  incomeEscalator?: number; // % per year, default 0
  mode?: CalcMode; // default 'forward'
  targetMonthlyRenta?: number; // used when mode === 'goalSeek'
}

export interface MilestoneRow {
  age: number;
  totalDeposited: number;
  portfolioValue: number;
  gain: number;
}

export interface Breakdown {
  // Inputs
  currentAge: number;
  retirementAge: number;
  rentaYears: number;
  monthlyInvestment: number;
  annualRate: number;
  initialLumpSum: number;
  incomeEscalator: number;
  valueAdjustment?: ValueAdjustment;

  // Spoření
  savingsYears: number;
  nSpor: number;
  monthlyRate: number;
  totalDeposited: number;
  totalInterest: number;
  fv: number;

  // Milníky
  milestones: MilestoneRow[];

  // Výplata renty
  nRenta: number;
  rentaFormula: string;
  totalPaidOut: number;
  principalInRenta: number;
  interestInRenta: number;

  // Reálná hodnota (jen když je advanced + valueAdjustment)
  fvReal?: number;
  R_real?: number;
  R_inf_real?: number;

  // Goal-seek
  derivedMonthlyInvestment?: number; // jen pro mode 'goalSeek'
}

export interface ChartPoint {
  age: number;
  value: number; // nominální
  realValue?: number; // hodnota v "dnešních" penězích, jen když je adjustment
}

export interface CalculationResult {
  fv: number;
  R: number;
  R_inf: number;
  fvReal?: number;
  R_real?: number;
  R_inf_real?: number;
  derivedMonthlyInvestment?: number;
  chartData: ChartPoint[];
  breakdown: Breakdown;
}

/** Měsíční úroková sazba z roční sazby v %. */
function monthlyRateFromAnnual(annualPct: number): number {
  const r = annualPct / 100;
  return Math.pow(1 + r, 1 / 12) - 1;
}

/**
 * Simulace měsíc po měsíci — vrací FV při daném vstupu.
 * Bere v potaz jednorázový vklad i roční eskalaci vkladu.
 */
function simulateFV(
  pmt0: number,
  lumpSum: number,
  i: number,
  nSpor: number,
  escalatorYearly: number,
): number {
  let capital = lumpSum;
  for (let m = 1; m <= nSpor; m++) {
    const yearIdx = Math.floor((m - 1) / 12);
    const pmt = pmt0 * Math.pow(1 + escalatorYearly, yearIdx);
    capital = capital * (1 + i) + pmt;
  }
  return capital;
}

/** Výpočet měsíční renty z FV a úroku (annuity payment). */
function annuityPayment(fv: number, i: number, nRenta: number): number {
  if (nRenta <= 0) return 0;
  if (i === 0) return fv / nRenta;
  const factor = Math.pow(1 + i, nRenta);
  return (fv * (i * factor)) / (factor - 1);
}

/**
 * Goal-seek: najde takový měsíční vklad, aby renta odpovídala cíli.
 * Bisekce na intervalu [0, 10 mil].
 */
function solveMonthlyInvestmentForRenta(
  targetRenta: number,
  lumpSum: number,
  i: number,
  nSpor: number,
  nRenta: number,
  escalatorYearly: number,
): number {
  let lo = 0;
  let hi = 10_000_000;
  for (let iter = 0; iter < 60; iter++) {
    const mid = (lo + hi) / 2;
    const fv = simulateFV(mid, lumpSum, i, nSpor, escalatorYearly);
    const r = annuityPayment(fv, i, nRenta);
    if (r < targetRenta) lo = mid;
    else hi = mid;
    if (hi - lo < 0.5) break;
  }
  return (lo + hi) / 2;
}

export function calculate(inputs: CalculationInputs): CalculationResult {
  const {
    currentAge,
    retirementAge,
    rentaYears,
    annualReturnRate,
    initialLumpSum = 0,
    advanced = false,
    valueAdjustment,
    incomeEscalator = 0,
    mode = 'forward',
    targetMonthlyRenta,
  } = inputs;

  const i = monthlyRateFromAnnual(annualReturnRate);
  const nSpor = (retirementAge - currentAge) * 12;
  const nRenta = rentaYears * 12;

  const escalatorYearly = advanced && incomeEscalator ? incomeEscalator / 100 : 0;
  const lumpSum = initialLumpSum > 0 ? initialLumpSum : 0;

  // Pokud goal-seek, dopočítáme PMT bisekcí; jinak používáme zadaný měsíční vklad
  let PMT_used: number;
  let derivedMonthlyInvestment: number | undefined;
  if (advanced && mode === 'goalSeek' && targetMonthlyRenta && targetMonthlyRenta > 0) {
    PMT_used = solveMonthlyInvestmentForRenta(
      targetMonthlyRenta,
      lumpSum,
      i,
      nSpor,
      nRenta,
      escalatorYearly,
    );
    derivedMonthlyInvestment = Math.round(PMT_used);
  } else {
    PMT_used = inputs.monthlyInvestment;
  }

  // === Simulace spořící fáze ===
  const chartData: ChartPoint[] = [];
  let capital = lumpSum;

  // Adjustment pro reálnou hodnotu (annual rate)
  const adjRateAnnual =
    advanced && valueAdjustment ? valueAdjustment.annualRate / 100 : 0;
  const realFactorAtYear = (yearsElapsed: number): number =>
    adjRateAnnual === 0 ? 1 : Math.pow(1 + adjRateAnnual, yearsElapsed);

  // Bod 0
  const startPoint: ChartPoint = { age: currentAge, value: lumpSum };
  if (advanced && valueAdjustment) startPoint.realValue = lumpSum;
  chartData.push(startPoint);

  let totalDeposited = lumpSum;
  for (let m = 1; m <= nSpor; m++) {
    const yearIdx = Math.floor((m - 1) / 12);
    const pmt = PMT_used * Math.pow(1 + escalatorYearly, yearIdx);
    capital = capital * (1 + i) + pmt;
    totalDeposited += pmt;

    if (m % 12 === 0) {
      const age = currentAge + m / 12;
      const yearsElapsed = age - currentAge;
      const point: ChartPoint = { age: Math.round(age), value: Math.floor(capital) };
      if (advanced && valueAdjustment) {
        point.realValue = Math.floor(capital / realFactorAtYear(yearsElapsed));
      }
      chartData.push(point);
    }
  }

  const fv = Math.floor(capital);
  // Zajistit přesný bod při retirementAge
  const lastSavingPoint = chartData[chartData.length - 1];
  if (lastSavingPoint.age !== retirementAge) {
    const point: ChartPoint = { age: retirementAge, value: fv };
    if (advanced && valueAdjustment) {
      point.realValue = Math.floor(fv / realFactorAtYear(retirementAge - currentAge));
    }
    chartData.push(point);
  }

  // === Renta — používáme nominální FV ===
  const R = Math.floor(annuityPayment(fv, i, nRenta));
  const R_inf = Math.floor(fv * i);

  // Fáze čerpání renty — simulace pro graf
  let payoutCapital = fv;
  for (let m = 1; m <= nRenta; m++) {
    payoutCapital = payoutCapital * (1 + i) - R;
    if (payoutCapital < 0) payoutCapital = 0;
    if (m % 12 === 0) {
      const age = retirementAge + m / 12;
      const yearsElapsed = age - currentAge;
      const point: ChartPoint = {
        age: Math.round(age),
        value: Math.floor(payoutCapital),
      };
      if (advanced && valueAdjustment) {
        point.realValue = Math.floor(payoutCapital / realFactorAtYear(yearsElapsed));
      }
      chartData.push(point);
    }
  }

  // Poslední bod = retirementAge + rentaYears, value = 0
  const lastAge = retirementAge + rentaYears;
  const last = chartData[chartData.length - 1];
  if (last.age !== lastAge) {
    const point: ChartPoint = { age: lastAge, value: 0 };
    if (advanced && valueAdjustment) point.realValue = 0;
    chartData.push(point);
  }

  // === Milníky ===
  const milestones: MilestoneRow[] = [];
  const step = 5;
  const milestoneAges: number[] = [];
  for (let age = currentAge + step; age < retirementAge; age += step) {
    milestoneAges.push(age);
  }
  if (!milestoneAges.includes(retirementAge)) {
    milestoneAges.push(retirementAge);
  }
  for (const age of milestoneAges) {
    const months = (age - currentAge) * 12;
    const val = simulateFV(PMT_used, lumpSum, i, months, escalatorYearly);
    let deposited = lumpSum;
    for (let m = 1; m <= months; m++) {
      const yearIdx = Math.floor((m - 1) / 12);
      deposited += PMT_used * Math.pow(1 + escalatorYearly, yearIdx);
    }
    milestones.push({
      age,
      totalDeposited: Math.floor(deposited),
      portfolioValue: Math.floor(val),
      gain: Math.floor(val - deposited),
    });
  }

  const totalInterest = fv - totalDeposited;
  const totalPaidOut = R * nRenta;
  const interestInRenta = Math.max(0, totalPaidOut - fv);

  const rentaFormula = `FV × (i × (1+i)^n) / ((1+i)^n − 1)`;

  // Reálná hodnota výsledných čísel — dělíme adjustmentem v okamžiku jejich zhmotnění
  let fvReal: number | undefined;
  let R_real: number | undefined;
  let R_inf_real: number | undefined;
  if (advanced && valueAdjustment) {
    const yearsToRetirement = retirementAge - currentAge;
    fvReal = Math.floor(fv / realFactorAtYear(yearsToRetirement));
    // R / R_inf vyjadřujeme v dnešních penězích k okamžiku odchodu do důchodu
    R_real = Math.floor(R / realFactorAtYear(yearsToRetirement));
    R_inf_real = Math.floor(R_inf / realFactorAtYear(yearsToRetirement));
  }

  const breakdown: Breakdown = {
    currentAge,
    retirementAge,
    rentaYears,
    monthlyInvestment: Math.round(PMT_used),
    annualRate: annualReturnRate,
    initialLumpSum: lumpSum,
    incomeEscalator: escalatorYearly * 100,
    valueAdjustment: advanced ? valueAdjustment : undefined,
    savingsYears: retirementAge - currentAge,
    nSpor,
    monthlyRate: i,
    totalDeposited: Math.floor(totalDeposited),
    totalInterest: Math.floor(totalInterest),
    fv,
    milestones,
    nRenta,
    rentaFormula,
    totalPaidOut: Math.floor(totalPaidOut),
    principalInRenta: fv,
    interestInRenta: Math.floor(interestInRenta),
    fvReal,
    R_real,
    R_inf_real,
    derivedMonthlyInvestment,
  };

  return {
    fv,
    R,
    R_inf,
    fvReal,
    R_real,
    R_inf_real,
    derivedMonthlyInvestment,
    chartData,
    breakdown,
  };
}
