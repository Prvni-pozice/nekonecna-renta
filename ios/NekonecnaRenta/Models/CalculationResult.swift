import Foundation

struct MilestoneRow: Identifiable {
    var id: Int { age }
    let age: Int
    let totalDeposited: Int
    let portfolioValue: Int
    let gain: Int
}

struct Breakdown {
    let totalDeposited: Int
    let totalInterest: Int
    let totalPaidOut: Int
    let principalInRenta: Int
    let interestInRenta: Int
    let monthlyRatePct: String
    let infFormulaDecomposed: String
}

struct ChartPoint: Identifiable {
    var id: Int { age }
    let age: Int
    let capital: Int
    var realValue: Int? = nil
}

struct CalculationResult {
    let monthlyRenta: Int
    let infiniteRenta: Int
    let futureValue: Int
    let chartData: [ChartPoint]
    let milestones: [MilestoneRow]
    let breakdown: Breakdown
    let inputs: CalculationInputs

    // Advanced — present only when value adjustment is on
    let futureValueReal: Int?
    let monthlyRentaReal: Int?
    let infiniteRentaReal: Int?

    // Goal-seek — present only when mode == .goalSeek
    let derivedMonthlyInvestment: Int?
}
