import SwiftUI

func shareText(result: CalculationResult) -> String {
    let inputs = result.inputs
    let years = inputs.retirementAge - inputs.currentAge
    let yrs = String(localized: "yrs")
    let mo = String(localized: "month")

    return [
        String(localized: "📊 My results from Endless Annuity"),
        "",
        String(localized: "⚙️ Settings"),
        "• \(String(localized: "Age")): \(inputs.currentAge) → \(inputs.retirementAge) \(yrs) (\(years) \(String(localized: "years of saving")))",
        "• \(String(localized: "Monthly investment")): \(Int(inputs.monthlyInvestment).formattedCZK)",
        "• \(String(localized: "Annual return")): \(inputs.annualReturnRate) %",
        "",
        "\(String(localized: "💰 Saved capital")): \(result.futureValue.formattedCZK)",
        "",
        String(localized: "📈 Results"),
        "• \(String(format: String(localized: "Annuity for %lld years"), inputs.rentaYears)): \(result.monthlyRenta.formattedCZK) / \(mo)",
        "• \(String(localized: "Endless Annuity")): \(result.infiniteRenta.formattedCZK) / \(mo)",
        "  (\(String(localized: "capital preserved")))",
        "",
        String(localized: "Calculated with the Endless Annuity app by První pozice"),
        "www.prvni-pozice.com",
    ].joined(separator: "\n")
}

struct ShareButtonView: View {
    let result: CalculationResult

    var body: some View {
        ShareLink(item: shareText(result: result)) {
            Label(String(localized: "Share results"), systemImage: "square.and.arrow.up")
                .font(.body)
                .fontWeight(.semibold)
                .foregroundStyle(Color.black)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.brandLime)
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .padding(.horizontal)
    }
}
