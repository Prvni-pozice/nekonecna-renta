import SwiftUI

private struct SectionHeader: View {
    let title: String
    var body: some View {
        Text(title)
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundStyle(Color.primary)
            .padding(.top, 8)
    }
}

private struct FormulaBox: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(.caption, design: .monospaced))
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.systemGray6))
            )
    }
}

private struct RowView: View {
    let label: String
    let value: String
    var highlighted: Bool = false

    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundStyle(highlighted ? Color.primary : Color.secondary)
                .fontWeight(highlighted ? .semibold : .regular)
            Spacer()
            Text(value)
                .font(.caption)
                .fontWeight(highlighted ? .bold : .regular)
                .foregroundStyle(highlighted ? Color.brandLime : Color.primary)
        }
        .padding(.vertical, 3)
    }
}

private struct MilestoneTableView: View {
    let milestones: [MilestoneRow]

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Age")
                    .frame(width: 36, alignment: .leading)
                Spacer()
                Text("Deposited")
                    .frame(width: 90, alignment: .trailing)
                Spacer()
                Text("Portfolio")
                    .frame(width: 90, alignment: .trailing)
                Spacer()
                Text("Return")
                    .frame(width: 90, alignment: .trailing)
            }
            .font(.caption2)
            .fontWeight(.semibold)
            .foregroundStyle(Color.secondary)
            .padding(.vertical, 6)
            .padding(.horizontal, 8)
            .background(Color(.systemGray6))

            ForEach(Array(milestones.enumerated()), id: \.element.id) { idx, row in
                HStack {
                    Text("\(row.age)")
                        .frame(width: 36, alignment: .leading)
                    Spacer()
                    Text(row.totalDeposited.formattedCZK)
                        .frame(width: 90, alignment: .trailing)
                    Spacer()
                    Text(row.portfolioValue.formattedCZK)
                        .frame(width: 90, alignment: .trailing)
                        .foregroundStyle(idx == milestones.count - 1 ? Color.brandLime : Color.primary)
                        .fontWeight(idx == milestones.count - 1 ? .semibold : .regular)
                    Spacer()
                    Text(row.gain.formattedCZK)
                        .frame(width: 90, alignment: .trailing)
                        .foregroundStyle(Color.green.opacity(0.8))
                }
                .font(.caption2)
                .padding(.vertical, 6)
                .padding(.horizontal, 8)
                .background(idx % 2 == 0 ? Color.clear : Color(.systemGray6).opacity(0.4))
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color(.systemGray4), lineWidth: 0.5)
        )
    }
}

struct BreakdownView: View {
    let result: CalculationResult
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            DisclosureGroup(isExpanded: $isExpanded) {
                VStack(alignment: .leading, spacing: 12) {
                    // Section: Inputs
                    SectionHeader(title: String(localized: "Inputs"))
                    VStack(spacing: 0) {
                        RowView(label: String(localized: "Current age"), value: "\(result.inputs.currentAge) \(String(localized: "yrs"))")
                        RowView(label: String(localized: "Retirement age"), value: "\(result.inputs.retirementAge) \(String(localized: "yrs"))")
                        RowView(label: String(localized: "Annuity years"), value: "\(result.inputs.rentaYears) \(String(localized: "yrs"))")
                        RowView(label: String(localized: "Monthly investment"), value: result.inputs.monthlyInvestment.formattedCZKDouble)
                        if result.inputs.initialLumpSum > 0 {
                            RowView(label: String(localized: "Initial lump sum"), value: result.inputs.initialLumpSum.formattedCZKDouble)
                        }
                        RowView(label: String(localized: "Annual return"), value: "\(result.inputs.annualReturnRate) %")
                        if result.inputs.advanced && result.inputs.incomeEscalator > 0 {
                            RowView(label: String(localized: "Annual increase of monthly investment"), value: String(format: "%.1f %%", result.inputs.incomeEscalator))
                        }
                        if result.inputs.advanced, let adj = result.inputs.valueAdjustment {
                            RowView(label: adj.parameter.localizedName, value: String(format: "%.1f %% / \(String(localized: "yr"))", adj.annualRate))
                        }
                        RowView(label: String(localized: "Monthly rate (i)"), value: "\(result.breakdown.monthlyRatePct) %")
                    }

                    Divider()

                    // Section: Savings phase
                    SectionHeader(title: String(localized: "Savings phase"))
                    let nSpor = (result.inputs.retirementAge - result.inputs.currentAge) * 12
                    FormulaBox(text: "FV = PMT × ((1+i)^n − 1) / i\nPMT = \(result.inputs.monthlyInvestment.formattedCZKDouble), i = \(result.breakdown.monthlyRatePct) %, n = \(nSpor) \(String(localized: "mo."))")
                    VStack(spacing: 0) {
                        RowView(label: String(localized: "Total deposited"), value: result.breakdown.totalDeposited.formattedCZK)
                        RowView(label: String(localized: "Investment returns"), value: result.breakdown.totalInterest.formattedCZK)
                        RowView(label: String(localized: "Portfolio value at retirement"), value: result.futureValue.formattedCZK, highlighted: true)
                    }

                    Divider()

                    // Section: Milestones
                    SectionHeader(title: String(localized: "Portfolio development by stages"))
                    MilestoneTableView(milestones: result.milestones)

                    Divider()

                    // Section: Withdrawal phase
                    SectionHeader(title: String(localized: "Annuity payout phase"))
                    let nRenta = result.inputs.rentaYears * 12
                    FormulaBox(text: "R = FV × (i × (1+i)^n) / ((1+i)^n − 1)\nFV = \(result.futureValue.formattedCZK), n = \(nRenta) \(String(localized: "mo."))")
                    VStack(spacing: 0) {
                        RowView(label: String(localized: "Initial capital"), value: result.breakdown.principalInRenta.formattedCZK)
                        RowView(label: String(localized: "Total paid out"), value: result.breakdown.totalPaidOut.formattedCZK)
                        RowView(label: String(localized: "Of which returns in annuity"), value: result.breakdown.interestInRenta.formattedCZK)
                        RowView(label: String(localized: "Monthly annuity"), value: result.monthlyRenta.formattedCZK, highlighted: true)
                    }

                    Divider()

                    // Section: Endless Annuity
                    SectionHeader(title: String(localized: "Endless Annuity"))
                    FormulaBox(text: result.breakdown.infFormulaDecomposed)
                    Text("With an endless annuity, you pay out only returns – the principal is preserved and the annuity can last forever.")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)

                    // Section: Real value (only when value adjustment is on)
                    if let fvReal = result.futureValueReal,
                       let rReal = result.monthlyRentaReal,
                       let rInfReal = result.infiniteRentaReal,
                       let adj = result.inputs.valueAdjustment {
                        Divider()
                        SectionHeader(title: String(localized: "In today's value"))
                        Text(String(format: String(localized: "Adjusted by %@ at %.1f %% per year"), adj.parameter.localizedName, adj.annualRate))
                            .font(.caption)
                            .foregroundStyle(Color.secondary)
                        VStack(spacing: 0) {
                            RowView(label: String(localized: "Portfolio value at retirement"), value: fvReal.formattedCZK)
                            RowView(label: String(localized: "Monthly annuity"), value: rReal.formattedCZK)
                            RowView(label: String(localized: "Endless Annuity"), value: rInfReal.formattedCZK)
                        }
                    }
                }
                .padding(.top, 12)
            } label: {
                Text("How we calculated it")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.primary)
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 2)
        )
        .padding(.horizontal)
    }
}

private extension Double {
    var formattedCZKDouble: String {
        let isCzech = Bundle.main.preferredLocalizations.first?.hasPrefix("cs") ?? false
        if isCzech {
            let formatter = NumberFormatter()
            formatter.numberStyle = .decimal
            formatter.locale = Locale(identifier: "cs_CZ")
            formatter.groupingSeparator = "\u{202F}"
            formatter.minimumFractionDigits = 0
            formatter.maximumFractionDigits = 0
            let formatted = formatter.string(from: NSNumber(value: self)) ?? "\(self)"
            return "\(formatted) Kč"
        } else {
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.locale = Locale(identifier: "en_GB")
            formatter.currencyCode = "EUR"
            formatter.maximumFractionDigits = 0
            return formatter.string(from: NSNumber(value: self)) ?? "€\(Int(self))"
        }
    }
}
