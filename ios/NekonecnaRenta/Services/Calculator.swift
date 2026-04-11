import Foundation

enum Calculator {
    static func calculate(_ inputs: CalculationInputs) -> CalculationResult {
        let PMT = inputs.monthlyInvestment
        let r = inputs.annualReturnRate / 100.0
        let i = pow(1.0 + r, 1.0 / 12.0) - 1.0

        let nSpor = (inputs.retirementAge - inputs.currentAge) * 12
        let nRenta = inputs.rentaYears * 12

        // FV ordinary annuity (deposits at end of period)
        let fvRaw: Double
        if i == 0 {
            fvRaw = PMT * Double(nSpor)
        } else {
            fvRaw = PMT * ((pow(1.0 + i, Double(nSpor)) - 1.0) / i)
        }
        let fv = Int(fvRaw.rounded(.down))

        // Monthly renta
        let rRaw: Double
        if i == 0 || nRenta == 0 {
            rRaw = nRenta > 0 ? Double(fv) / Double(nRenta) : 0.0
        } else {
            let factor = pow(1.0 + i, Double(nRenta))
            rRaw = Double(fv) * (i * factor) / (factor - 1.0)
        }
        let R = Int(rRaw.rounded(.down))

        // Infinite renta
        let rInfRaw = Double(fv) * i
        let rInf = Int(rInfRaw.rounded(.down))

        // Chart data
        var chartData: [ChartPoint] = []
        chartData.append(ChartPoint(age: inputs.currentAge, capital: 0))

        // Savings phase
        var capital = 0.0
        var lastYearAdded = inputs.currentAge
        for month in 1...max(1, nSpor) {
            capital = capital * (1.0 + i) + PMT
            let ageAtMonth = inputs.currentAge + month / 12
            if month % 12 == 0 && ageAtMonth > lastYearAdded {
                chartData.append(ChartPoint(age: ageAtMonth, capital: Int(capital.rounded(.down))))
                lastYearAdded = ageAtMonth
            }
        }
        // Ensure retirement point is added
        if chartData.last?.age != inputs.retirementAge {
            chartData.append(ChartPoint(age: inputs.retirementAge, capital: fv))
        }

        // Withdrawal phase
        var withdrawalCapital = Double(fv)
        var lastWithdrawalYear = inputs.retirementAge
        if nRenta > 0 {
            for month in 1...nRenta {
                withdrawalCapital = withdrawalCapital * (1.0 + i) - Double(R)
                withdrawalCapital = max(0.0, withdrawalCapital)
                let ageAtMonth = inputs.retirementAge + month / 12
                if month % 12 == 0 && ageAtMonth > lastWithdrawalYear {
                    chartData.append(ChartPoint(age: ageAtMonth, capital: Int(withdrawalCapital.rounded(.down))))
                    lastWithdrawalYear = ageAtMonth
                }
            }
        }
        // Ensure end point
        let endAge = inputs.retirementAge + inputs.rentaYears
        if chartData.last?.age != endAge {
            chartData.append(ChartPoint(age: endAge, capital: 0))
        }

        // Milestones every 5 years during savings phase + retirement age
        var milestoneAges: [Int] = []
        var milestoneAge = inputs.currentAge + 5
        while milestoneAge < inputs.retirementAge {
            milestoneAges.append(milestoneAge)
            milestoneAge += 5
        }
        milestoneAges.append(inputs.retirementAge)

        var milestones: [MilestoneRow] = []
        for age in milestoneAges {
            let months = (age - inputs.currentAge) * 12
            let val: Int
            if i == 0 {
                val = Int((PMT * Double(months)).rounded(.down))
            } else {
                val = Int((PMT * ((pow(1.0 + i, Double(months)) - 1.0) / i)).rounded(.down))
            }
            let deposited = Int((PMT * Double(months)).rounded(.down))
            let gain = Int((Double(val) - Double(deposited)).rounded(.down))
            milestones.append(MilestoneRow(
                age: age,
                totalDeposited: deposited,
                portfolioValue: val,
                gain: gain
            ))
        }

        // Breakdown
        let totalDeposited = Int((PMT * Double(nSpor)).rounded(.down))
        let totalInterest = fv - totalDeposited
        let totalPaidOut = Int((Double(R) * Double(nRenta)).rounded(.down))
        let principalInRenta = fv
        let interestInRenta = max(0, Int((Double(R) * Double(nRenta) - Double(fv)).rounded(.down)))
        let monthlyRatePct = String(format: "%.4f", i * 100)
        let infFormulaDecomposed = "R∞ = \(fv.formattedCZK) × \(monthlyRatePct) % = \(rInf.formattedCZK) / měsíc"

        let breakdown = Breakdown(
            totalDeposited: totalDeposited,
            totalInterest: totalInterest,
            totalPaidOut: totalPaidOut,
            principalInRenta: principalInRenta,
            interestInRenta: interestInRenta,
            monthlyRatePct: monthlyRatePct,
            infFormulaDecomposed: infFormulaDecomposed
        )

        return CalculationResult(
            monthlyRenta: R,
            infiniteRenta: rInf,
            futureValue: fv,
            chartData: chartData,
            milestones: milestones,
            breakdown: breakdown,
            inputs: inputs
        )
    }
}
