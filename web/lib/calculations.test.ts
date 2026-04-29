import { describe, it, expect } from 'vitest';
import { calculate } from './calculations';

describe('calculate', () => {
  it('běžný případ – 30 let spoření, 6 % p.a.', () => {
    const result = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 6,
    });

    expect(result.fv).toBeGreaterThan(0);
    expect(result.R).toBeGreaterThan(0);
    expect(result.R_inf).toBeGreaterThan(0);
    // Renta na X let musí být větší než nekonečná renta
    expect(result.R).toBeGreaterThan(result.R_inf);
    // FV z chartData v bodě důchodu musí odpovídat FV z výpočtu
    const retirementPoint = result.chartData.find(p => p.age === 60);
    expect(retirementPoint).toBeDefined();
    expect(Math.abs(retirementPoint!.value - result.fv)).toBeLessThanOrEqual(1);
  });

  it('nulová úroková sazba (i=0)', () => {
    const result = calculate({
      currentAge: 40,
      retirementAge: 65,
      rentaYears: 15,
      monthlyInvestment: 3000,
      annualReturnRate: 0,
    });

    const nSpor = (65 - 40) * 12;
    const expectedFV = 3000 * nSpor;
    expect(result.fv).toBe(expectedFV);

    const nRenta = 15 * 12;
    const expectedR = Math.floor(expectedFV / nRenta);
    expect(result.R).toBe(expectedR);

    // Nekonečná renta je 0 při i=0
    expect(result.R_inf).toBe(0);
  });

  it('krátké spoření (1 rok)', () => {
    const result = calculate({
      currentAge: 50,
      retirementAge: 51,
      rentaYears: 5,
      monthlyInvestment: 10000,
      annualReturnRate: 6,
    });

    expect(result.fv).toBeGreaterThan(0);
    expect(result.R).toBeGreaterThan(0);
    expect(result.chartData.length).toBeGreaterThan(0);
  });

  it('FV z chartData == FV z anuitního vzorce', () => {
    const inputs = {
      currentAge: 25,
      retirementAge: 55,
      rentaYears: 25,
      monthlyInvestment: 8000,
      annualReturnRate: 7,
    };
    const result = calculate(inputs);

    const retirementPoint = result.chartData.find(p => p.age === inputs.retirementAge);
    expect(retirementPoint).toBeDefined();
    // Tolerance 1 Kč (floor rounding)
    expect(Math.abs(retirementPoint!.value - result.fv)).toBeLessThanOrEqual(1);
  });

  it('vysoký výnos (10 %)', () => {
    const result = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 10,
    });

    // Při 10 % musí být FV větší než při 6 %
    const result6 = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 6,
    });

    expect(result.fv).toBeGreaterThan(result6.fv);
  });

  it('jednorázový vklad zvyšuje FV', () => {
    const base = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 6,
    });
    const withLump = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 6,
      initialLumpSum: 100_000,
    });
    expect(withLump.fv).toBeGreaterThan(base.fv);
    // 100k zhodnocených 30 let při 6 % ≈ 600k+ — vyšší než 100k navíc
    expect(withLump.fv - base.fv).toBeGreaterThan(500_000);
  });

  it('roční nárůst vkladu (escalator) zvyšuje FV', () => {
    const base = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 6,
      advanced: true,
      incomeEscalator: 0,
    });
    const escalated = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 6,
      advanced: true,
      incomeEscalator: 5,
    });
    expect(escalated.fv).toBeGreaterThan(base.fv * 1.5);
  });

  it('value adjustment plní reálné hodnoty + chart point má realValue', () => {
    const result = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 5000,
      annualReturnRate: 6,
      advanced: true,
      valueAdjustment: { parameter: 'inflation', annualRate: 3.5 },
    });
    expect(result.fvReal).toBeDefined();
    expect(result.R_real).toBeDefined();
    expect(result.R_inf_real).toBeDefined();
    // Reálná hodnota po 30 letech inflace musí být menší než nominální
    expect(result.fvReal!).toBeLessThan(result.fv);
    // chartData musí mít realValue
    const point = result.chartData.find(p => p.age === 60);
    expect(point?.realValue).toBeDefined();
    expect(point!.realValue!).toBeLessThan(point!.value);
  });

  it('goal-seek najde PMT, který reprodukuje cílovou rentu', () => {
    const target = 30_000;
    const result = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 0,
      annualReturnRate: 6,
      advanced: true,
      mode: 'goalSeek',
      targetMonthlyRenta: target,
    });
    expect(result.derivedMonthlyInvestment).toBeDefined();
    expect(result.derivedMonthlyInvestment!).toBeGreaterThan(0);
    // Renta v výsledku musí být ~ target (tolerance 1 Kč)
    expect(Math.abs(result.R - target)).toBeLessThanOrEqual(2);
  });

  it('goal-seek s lump sumem vyžaduje menší PMT', () => {
    const target = 30_000;
    const noLump = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 0,
      annualReturnRate: 6,
      advanced: true,
      mode: 'goalSeek',
      targetMonthlyRenta: target,
    });
    const withLump = calculate({
      currentAge: 30,
      retirementAge: 60,
      rentaYears: 20,
      monthlyInvestment: 0,
      annualReturnRate: 6,
      initialLumpSum: 500_000,
      advanced: true,
      mode: 'goalSeek',
      targetMonthlyRenta: target,
    });
    expect(withLump.derivedMonthlyInvestment!).toBeLessThan(noLump.derivedMonthlyInvestment!);
  });
});
