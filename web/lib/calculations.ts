export interface CalculationInputs {
  currentAge: number;
  retirementAge: number;
  rentaYears: number;
  monthlyInvestment: number;
  annualReturnRate: number; // percent, e.g. 6 for 6%
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

  // Spoření
  savingsYears: number;
  nSpor: number;
  monthlyRate: number; // effective monthly rate as decimal
  totalDeposited: number;
  totalInterest: number;
  fv: number;

  // Milníky po 5 letech
  milestones: MilestoneRow[];

  // Výplata renty
  nRenta: number;
  rentaFormula: string;
  totalPaidOut: number;
  principalInRenta: number;
  interestInRenta: number;

  // Nekonečná renta
  infFormulaDecomposed: string;
}

export interface ChartPoint {
  age: number;
  value: number;
}

export interface CalculationResult {
  fv: number;
  R: number;
  R_inf: number;
  chartData: ChartPoint[];
  breakdown: Breakdown;
}

export function calculate(inputs: CalculationInputs): CalculationResult {
  const { currentAge, retirementAge, rentaYears, monthlyInvestment: PMT, annualReturnRate } = inputs;

  const r = annualReturnRate / 100;
  const i = Math.pow(1 + r, 1 / 12) - 1;

  const nSpor = (retirementAge - currentAge) * 12;
  const nRenta = rentaYears * 12;

  // FV of annuity-due (end of period deposits)
  let fv: number;
  if (i === 0) {
    fv = PMT * nSpor;
  } else {
    fv = PMT * ((Math.pow(1 + i, nSpor) - 1) / i);
  }
  fv = Math.floor(fv);

  // Monthly renta (annuity)
  let R: number;
  if (i === 0 || nRenta === 0) {
    R = nRenta > 0 ? Math.floor(fv / nRenta) : 0;
  } else {
    const factor = Math.pow(1 + i, nRenta);
    R = Math.floor(fv * (i * factor) / (factor - 1));
  }

  // Nekonečná renta
  const R_inf = Math.floor(fv * i);

  // Chart data – month by month, store yearly points
  const chartData: ChartPoint[] = [];

  // Fáze spoření
  let capital = 0;
  // Store point at age 0 (start)
  chartData.push({ age: currentAge, value: 0 });

  for (let m = 1; m <= nSpor; m++) {
    capital = capital * (1 + i) + PMT;
    const ageAtMonth = currentAge + m / 12;
    // Save at each full year
    if (m % 12 === 0) {
      const age = currentAge + m / 12;
      chartData.push({ age: Math.round(age), value: Math.floor(capital) });
    }
  }

  // Ensure we have retirement point exactly
  const lastSavingPoint = chartData[chartData.length - 1];
  if (lastSavingPoint.age !== retirementAge) {
    chartData.push({ age: retirementAge, value: Math.floor(capital) });
  }

  // Fáze čerpání renty
  for (let m = 1; m <= nRenta; m++) {
    capital = capital * (1 + i) - R;
    if (capital < 0) capital = 0;
    if (m % 12 === 0) {
      const age = retirementAge + m / 12;
      chartData.push({ age: Math.round(age), value: Math.floor(capital) });
    }
  }

  // Ensure last point is 0 or near 0
  const lastAge = retirementAge + rentaYears;
  const last = chartData[chartData.length - 1];
  if (last.age !== lastAge) {
    chartData.push({ age: lastAge, value: 0 });
  }

  // Milníky každých 5 let + věk důchodu
  const milestones: MilestoneRow[] = [];
  const step = 5;
  let milestoneAges: number[] = [];
  for (let age = currentAge + step; age < retirementAge; age += step) {
    milestoneAges.push(age);
  }
  if (!milestoneAges.includes(retirementAge)) {
    milestoneAges.push(retirementAge);
  }

  for (const age of milestoneAges) {
    const months = (age - currentAge) * 12;
    let val: number;
    if (i === 0) {
      val = PMT * months;
    } else {
      val = PMT * ((Math.pow(1 + i, months) - 1) / i);
    }
    val = Math.floor(val);
    const deposited = PMT * months;
    milestones.push({
      age,
      totalDeposited: Math.floor(deposited),
      portfolioValue: val,
      gain: Math.floor(val - deposited),
    });
  }

  const totalDeposited = PMT * nSpor;
  const totalInterest = fv - totalDeposited;
  const totalPaidOut = R * nRenta;
  const interestInRenta = totalPaidOut - fv;

  const monthlyRatePct = (i * 100).toFixed(4);
  const rentaFormula = `FV × (i × (1+i)^n) / ((1+i)^n − 1)`;
  const infFormulaDecomposed = `R∞ = ${fmt(fv)} × ${monthlyRatePct} % = ${fmt(R_inf)} Kč / měsíc`;

  const breakdown: Breakdown = {
    currentAge,
    retirementAge,
    rentaYears,
    monthlyInvestment: PMT,
    annualRate: annualReturnRate,
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
    interestInRenta: Math.max(0, Math.floor(interestInRenta)),
    infFormulaDecomposed,
  };

  return { fv, R, R_inf, chartData, breakdown };
}

function fmt(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(n);
}
