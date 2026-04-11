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
}

struct CalculationResult {
    let monthlyRenta: Int
    let infiniteRenta: Int
    let futureValue: Int
    let chartData: [ChartPoint]
    let milestones: [MilestoneRow]
    let breakdown: Breakdown
    let inputs: CalculationInputs
}
