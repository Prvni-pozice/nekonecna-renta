import Foundation

enum ValueAdjustmentParam: String, CaseIterable, Hashable {
    case inflation
    case wage
    case realEstate

    /// Default annual rates (CZ averages, last ~10 years).
    var defaultRate: Double {
        switch self {
        case .inflation: return 3.5
        case .wage:      return 5.0
        case .realEstate: return 6.0
        }
    }

    var localizedName: String {
        switch self {
        case .inflation:  return String(localized: "Inflation")
        case .wage:       return String(localized: "Wage growth")
        case .realEstate: return String(localized: "Real-estate growth")
        }
    }
}

struct ValueAdjustment: Equatable {
    var parameter: ValueAdjustmentParam
    var annualRate: Double // percent
}

enum CalcMode: String, CaseIterable, Hashable {
    case forward
    case goalSeek
}

struct CalculationInputs {
    var currentAge: Int
    var retirementAge: Int
    var rentaYears: Int
    var monthlyInvestment: Double
    var annualReturnRate: Double

    // Optional advanced
    var initialLumpSum: Double = 0
    var advanced: Bool = false
    var valueAdjustment: ValueAdjustment? = nil
    var incomeEscalator: Double = 0 // percent per year
    var mode: CalcMode = .forward
    var targetMonthlyRenta: Double = 0
}
