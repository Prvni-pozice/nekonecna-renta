import SwiftUI

@MainActor
@Observable
final class RentaViewModel {
    var currentAge: String = "30"
    var retirementAge: String = "60"
    var rentaYears: String = "20"
    var monthlyInvestment: String = "5000"
    var annualRate: String = "6"

    var errors: [String: String] {
        var errs: [String: String] = [:]

        let ca = Int(currentAge) ?? -1
        let ra = Int(retirementAge) ?? -1
        let ry = Int(rentaYears) ?? -1
        let mi = Double(monthlyInvestment.replacingOccurrences(of: ",", with: ".")) ?? -1
        let ar = Double(annualRate.replacingOccurrences(of: ",", with: ".")) ?? -1

        if ca < 18 || ca > 80 {
            errs["currentAge"] = String(localized: "Age must be 18–80")
        }
        if ra <= ca {
            errs["retirementAge"] = String(localized: "Must be higher than current age")
        } else if ra > 85 {
            errs["retirementAge"] = String(localized: "Maximum 85 years")
        }
        if ry < 1 || ry > 50 {
            errs["rentaYears"] = String(localized: "Annuity years must be 1–50")
        }
        if mi < 0 || mi > 1_000_000 {
            errs["monthlyInvestment"] = String(localized: "Investment 0–1,000,000 CZK")
        }
        if ar < 0 || ar > 20 {
            errs["annualRate"] = String(localized: "Return 0–20%")
        }

        return errs
    }

    var result: CalculationResult? {
        guard errors.isEmpty else { return nil }
        let ca = Int(currentAge) ?? 0
        let ra = Int(retirementAge) ?? 0
        let ry = Int(rentaYears) ?? 0
        let mi = Double(monthlyInvestment.replacingOccurrences(of: ",", with: ".")) ?? 0
        let ar = Double(annualRate.replacingOccurrences(of: ",", with: ".")) ?? 0
        let inputs = CalculationInputs(
            currentAge: ca,
            retirementAge: ra,
            rentaYears: ry,
            monthlyInvestment: mi,
            annualReturnRate: ar
        )
        return Calculator.calculate(inputs)
    }
}

struct ContentView: View {
    @State private var vm = RentaViewModel()
    @State private var previousResult: CalculationResult?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 6) {
                    Text("Endless Annuity")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundStyle(Color.primary)
                    Text("Calculate how much you can save for retirement")
                        .font(.subheadline)
                        .foregroundStyle(Color.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 16)
                .padding(.horizontal)

                // Inputs
                InputSection(vm: vm)

                // Results or empty state
                if let result = vm.result {
                    ResultCardsView(result: result)

                    // Disclaimer
                    Text("Indicative calculation. Does not account for inflation or investment taxes. Not investment advice.")
                        .font(.caption2)
                        .foregroundStyle(Color.secondary.opacity(0.6))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)

                    CapitalChartView(result: result)
                    BreakdownView(result: result)
                    ShareButtonView(result: result)
                } else {
                    RoundedRectangle(cornerRadius: 16)
                        .strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [8, 4]))
                        .foregroundStyle(Color.secondary.opacity(0.4))
                        .frame(height: 120)
                        .overlay {
                            Text("Fill in all fields correctly to see your results")
                                .font(.body)
                                .foregroundStyle(Color.secondary)
                                .multilineTextAlignment(.center)
                                .padding()
                        }
                        .padding(.horizontal)
                }

                // O aplikaci + footer – vždy viditelné
                AboutView()

                Spacer(minLength: 8)
            }
        }
        .onChange(of: vm.result?.monthlyRenta) { _, newValue in
            if newValue != nil {
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.impactOccurred()
            }
        }
    }
}

#Preview {
    ContentView()
}
