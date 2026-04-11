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
});
