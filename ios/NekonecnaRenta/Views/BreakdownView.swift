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
                Text("Věk")
                    .frame(width: 36, alignment: .leading)
                Spacer()
                Text("Vloženo")
                    .frame(width: 90, alignment: .trailing)
                Spacer()
                Text("Portfolio")
                    .frame(width: 90, alignment: .trailing)
                Spacer()
                Text("Výnos")
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
                    SectionHeader(title: "Vstupy")
                    VStack(spacing: 0) {
                        RowView(label: "Aktuální věk", value: "\(result.inputs.currentAge) let")
                        RowView(label: "Věk do důchodu", value: "\(result.inputs.retirementAge) let")
                        RowView(label: "Roky pobírání renty", value: "\(result.inputs.rentaYears) let")
                        RowView(label: "Měsíční investice", value: result.inputs.monthlyInvestment.formattedCZKDouble)
                        RowView(label: "Roční zhodnocení", value: "\(result.inputs.annualReturnRate) %")
                        RowView(label: "Měsíční sazba (i)", value: "\(result.breakdown.monthlyRatePct) %")
                    }

                    Divider()

                    // Section: Savings phase
                    SectionHeader(title: "Fáze spoření")
                    let nSpor = (result.inputs.retirementAge - result.inputs.currentAge) * 12
                    FormulaBox(text: "FV = PMT × ((1+i)^n − 1) / i\nPMT = \(result.inputs.monthlyInvestment.formattedCZKDouble), i = \(result.breakdown.monthlyRatePct) %, n = \(nSpor) měs.")
                    VStack(spacing: 0) {
                        RowView(label: "Celkem vloženo", value: result.breakdown.totalDeposited.formattedCZK)
                        RowView(label: "Výnosy z investic", value: result.breakdown.totalInterest.formattedCZK)
                        RowView(label: "Hodnota portfolia při odchodu do důchodu", value: result.futureValue.formattedCZK, highlighted: true)
                    }

                    Divider()

                    // Section: Milestones
                    SectionHeader(title: "Vývoj portfolia po etapách")
                    MilestoneTableView(milestones: result.milestones)

                    Divider()

                    // Section: Withdrawal phase
                    SectionHeader(title: "Fáze výplaty renty")
                    let nRenta = result.inputs.rentaYears * 12
                    FormulaBox(text: "R = FV × (i × (1+i)^n) / ((1+i)^n − 1)\nFV = \(result.futureValue.formattedCZK), n = \(nRenta) měs.")
                    VStack(spacing: 0) {
                        RowView(label: "Počáteční kapitál", value: result.breakdown.principalInRenta.formattedCZK)
                        RowView(label: "Celkem vyplaceno", value: result.breakdown.totalPaidOut.formattedCZK)
                        RowView(label: "Z toho výnosy v rentě", value: result.breakdown.interestInRenta.formattedCZK)
                        RowView(label: "Měsíční renta", value: result.monthlyRenta.formattedCZK, highlighted: true)
                    }

                    Divider()

                    // Section: Infinite renta
                    SectionHeader(title: "Nekonečná renta")
                    FormulaBox(text: result.breakdown.infFormulaDecomposed)
                    Text("Při nekonečné rentě vyplácíte jen výnosy – jistina zůstává zachována a renta může trvat donekonečna.")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                }
                .padding(.top, 12)
            } label: {
                Text("Jak jsme to spočítali")
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
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: "cs_CZ")
        formatter.groupingSeparator = "\u{202F}"
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 0
        let formatted = formatter.string(from: NSNumber(value: self)) ?? "\(self)"
        return "\(formatted) Kč"
    }
}
