import Foundation

enum Calculator {

    // MARK: - Public

    static func calculate(_ inputs: CalculationInputs) -> CalculationResult {
        let r = inputs.annualReturnRate / 100.0
        let i = pow(1.0 + r, 1.0 / 12.0) - 1.0

        let nSpor = (inputs.retirementAge - inputs.currentAge) * 12
        let nRenta = inputs.rentaYears * 12

        let lumpSum = max(0.0, inputs.initialLumpSum)
        let escalatorYearly = inputs.advanced ? inputs.incomeEscalator / 100.0 : 0.0
        let isGoalSeek = inputs.advanced && inputs.mode == .goalSeek && inputs.targetMonthlyRenta > 0

        // Determine PMT (forward = given; goal-seek = bisection)
        let PMT_used: Double
        let derivedMonthlyInvestment: Int?
        if isGoalSeek {
            let solved = solveMonthlyInvestmentForRenta(
                target: inputs.targetMonthlyRenta,
                lumpSum: lumpSum,
                i: i,
                nSpor: nSpor,
                nRenta: nRenta,
                escalator: escalatorYearly
            )
            PMT_used = solved
            derivedMonthlyInvestment = Int(solved.rounded())
        } else {
            PMT_used = inputs.monthlyInvestment
            derivedMonthlyInvestment = nil
        }

        // === Savings simulation ===
        var chartData: [ChartPoint] = []
        var capital = lumpSum
        var totalDeposited = lumpSum

        let adjAnnualRate = inputs.advanced ? (inputs.valueAdjustment?.annualRate ?? 0) / 100.0 : 0.0
        let hasAdj = inputs.advanced && inputs.valueAdjustment != nil
        func realFactor(at yearsElapsed: Double) -> Double {
            adjAnnualRate == 0 ? 1.0 : pow(1.0 + adjAnnualRate, yearsElapsed)
        }

        // Start point
        var startPoint = ChartPoint(age: inputs.currentAge, capital: Int(lumpSum.rounded(.down)))
        if hasAdj { startPoint = ChartPoint(age: inputs.currentAge, capital: Int(lumpSum.rounded(.down)), realValue: Int(lumpSum.rounded(.down))) }
        chartData.append(startPoint)

        if nSpor > 0 {
            for month in 1...nSpor {
                let yearIdx = (month - 1) / 12
                let pmt = PMT_used * pow(1.0 + escalatorYearly, Double(yearIdx))
                capital = capital * (1.0 + i) + pmt
                totalDeposited += pmt

                if month % 12 == 0 {
                    let age = inputs.currentAge + month / 12
                    let yearsElapsed = Double(age - inputs.currentAge)
                    let cap = Int(capital.rounded(.down))
                    let real: Int? = hasAdj ? Int((capital / realFactor(at: yearsElapsed)).rounded(.down)) : nil
                    chartData.append(ChartPoint(age: age, capital: cap, realValue: real))
                }
            }
        }

        let fv = Int(capital.rounded(.down))
        if chartData.last?.age != inputs.retirementAge {
            let yearsElapsed = Double(inputs.retirementAge - inputs.currentAge)
            let real: Int? = hasAdj ? Int((Double(fv) / realFactor(at: yearsElapsed)).rounded(.down)) : nil
            chartData.append(ChartPoint(age: inputs.retirementAge, capital: fv, realValue: real))
        }

        // === Annuity payment ===
        let R = Int(annuityPayment(fv: Double(fv), i: i, nRenta: nRenta).rounded(.down))
        let rInf = Int((Double(fv) * i).rounded(.down))

        // === Withdrawal phase ===
        var withdrawalCapital = Double(fv)
        if nRenta > 0 {
            for month in 1...nRenta {
                withdrawalCapital = withdrawalCapital * (1.0 + i) - Double(R)
                withdrawalCapital = max(0.0, withdrawalCapital)
                if month % 12 == 0 {
                    let age = inputs.retirementAge + month / 12
                    let yearsElapsed = Double(age - inputs.currentAge)
                    let cap = Int(withdrawalCapital.rounded(.down))
                    let real: Int? = hasAdj ? Int((withdrawalCapital / realFactor(at: yearsElapsed)).rounded(.down)) : nil
                    chartData.append(ChartPoint(age: age, capital: cap, realValue: real))
                }
            }
        }
        let endAge = inputs.retirementAge + inputs.rentaYears
        if chartData.last?.age != endAge {
            let real: Int? = hasAdj ? 0 : nil
            chartData.append(ChartPoint(age: endAge, capital: 0, realValue: real))
        }

        // === Milestones ===
        var milestones: [MilestoneRow] = []
        var milestoneAges: [Int] = []
        var ageM = inputs.currentAge + 5
        while ageM < inputs.retirementAge {
            milestoneAges.append(ageM)
            ageM += 5
        }
        if !milestoneAges.contains(inputs.retirementAge) {
            milestoneAges.append(inputs.retirementAge)
        }
        for age in milestoneAges {
            let months = (age - inputs.currentAge) * 12
            let val = simulateFV(pmt0: PMT_used, lumpSum: lumpSum, i: i, nSpor: months, escalator: escalatorYearly)
            var deposited = lumpSum
            if months > 0 {
                for m in 1...months {
                    let yearIdx = (m - 1) / 12
                    deposited += PMT_used * pow(1.0 + escalatorYearly, Double(yearIdx))
                }
            }
            milestones.append(MilestoneRow(
                age: age,
                totalDeposited: Int(deposited.rounded(.down)),
                portfolioValue: Int(val.rounded(.down)),
                gain: Int((val - deposited).rounded(.down))
            ))
        }

        // === Breakdown ===
        let totalInterest = fv - Int(totalDeposited.rounded(.down))
        let totalPaidOut = Int((Double(R) * Double(nRenta)).rounded(.down))
        let principalInRenta = fv
        let interestInRenta = max(0, Int((Double(R) * Double(nRenta) - Double(fv)).rounded(.down)))
        let monthlyRatePct = String(format: "%.4f", i * 100)
        let infFormula = "R∞ = \(fv.formattedCZK) × \(monthlyRatePct) % = \(rInf.formattedCZK) / \(String(localized: "month"))"

        let breakdown = Breakdown(
            totalDeposited: Int(totalDeposited.rounded(.down)),
            totalInterest: totalInterest,
            totalPaidOut: totalPaidOut,
            principalInRenta: principalInRenta,
            interestInRenta: interestInRenta,
            monthlyRatePct: monthlyRatePct,
            infFormulaDecomposed: infFormula
        )

        // === Real values ===
        var fvReal: Int? = nil
        var rReal: Int? = nil
        var rInfReal: Int? = nil
        if hasAdj {
            let years = Double(inputs.retirementAge - inputs.currentAge)
            let factor = realFactor(at: years)
            fvReal = Int((Double(fv) / factor).rounded(.down))
            rReal = Int((Double(R) / factor).rounded(.down))
            rInfReal = Int((Double(rInf) / factor).rounded(.down))
        }

        // Reflect derived PMT into inputs for downstream display
        var displayedInputs = inputs
        if let derived = derivedMonthlyInvestment {
            displayedInputs.monthlyInvestment = Double(derived)
        }

        return CalculationResult(
            monthlyRenta: R,
            infiniteRenta: rInf,
            futureValue: fv,
            chartData: chartData,
            milestones: milestones,
            breakdown: breakdown,
            inputs: displayedInputs,
            futureValueReal: fvReal,
            monthlyRentaReal: rReal,
            infiniteRentaReal: rInfReal,
            derivedMonthlyInvestment: derivedMonthlyInvestment
        )
    }

    // MARK: - Helpers

    private static func simulateFV(pmt0: Double, lumpSum: Double, i: Double, nSpor: Int, escalator: Double) -> Double {
        var capital = lumpSum
        if nSpor <= 0 { return capital }
        for m in 1...nSpor {
            let yearIdx = (m - 1) / 12
            let pmt = pmt0 * pow(1.0 + escalator, Double(yearIdx))
            capital = capital * (1.0 + i) + pmt
        }
        return capital
    }

    private static func annuityPayment(fv: Double, i: Double, nRenta: Int) -> Double {
        if nRenta <= 0 { return 0 }
        if i == 0 { return fv / Double(nRenta) }
        let factor = pow(1.0 + i, Double(nRenta))
        return fv * (i * factor) / (factor - 1.0)
    }

    private static func solveMonthlyInvestmentForRenta(
        target: Double, lumpSum: Double, i: Double, nSpor: Int, nRenta: Int, escalator: Double
    ) -> Double {
        var lo = 0.0
        var hi = 10_000_000.0
        for _ in 0..<60 {
            let mid = (lo + hi) / 2.0
            let fv = simulateFV(pmt0: mid, lumpSum: lumpSum, i: i, nSpor: nSpor, escalator: escalator)
            let r = annuityPayment(fv: fv, i: i, nRenta: nRenta)
            if r < target { lo = mid } else { hi = mid }
            if hi - lo < 0.5 { break }
        }
        return (lo + hi) / 2.0
    }
}
