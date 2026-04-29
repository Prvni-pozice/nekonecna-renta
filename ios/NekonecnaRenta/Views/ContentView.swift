import SwiftUI

@MainActor
@Observable
final class RentaViewModel {
    var currentAge: String = "30"
    var retirementAge: String = "60"
    var rentaYears: String = "20"
    var monthlyInvestment: String = "5000"
    var annualRate: String = "6"

    // Initial lump sum
    var lumpSumExpanded: Bool = false
    var initialLumpSum: String = ""

    // Advanced mode
    var advancedEnabled: Bool = false
    var adjustmentParam: ValueAdjustmentParam = .inflation
    var adjustmentRate: String = String(format: "%.1f", ValueAdjustmentParam.inflation.defaultRate)
    var escalator: String = "0"
    var mode: CalcMode = .forward
    var targetMonthlyRenta: String = "30000"

    func selectAdjustmentParam(_ p: ValueAdjustmentParam) {
        adjustmentParam = p
        adjustmentRate = String(format: "%.1f", p.defaultRate)
    }

    private static func parseDouble(_ s: String) -> Double? {
        Double(s.replacingOccurrences(of: ",", with: "."))
    }

    var errors: [String: String] {
        var errs: [String: String] = [:]

        let ca = Int(currentAge) ?? -1
        let ra = Int(retirementAge) ?? -1
        let ry = Int(rentaYears) ?? -1
        let mi = Self.parseDouble(monthlyInvestment) ?? -1
        let ar = Self.parseDouble(annualRate) ?? -1
        let lump = initialLumpSum.trimmingCharacters(in: .whitespaces).isEmpty
            ? 0
            : (Self.parseDouble(initialLumpSum) ?? -1)
        let adjRate = Self.parseDouble(adjustmentRate) ?? -1
        let esc = Self.parseDouble(escalator) ?? -1
        let target = Self.parseDouble(targetMonthlyRenta) ?? -1

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

        let isGoalSeek = advancedEnabled && mode == .goalSeek
        if !isGoalSeek {
            if mi < 0 || mi > 10_000_000 {
                errs["monthlyInvestment"] = String(localized: "Investment 0–10,000,000 CZK")
            }
        }
        if ar < 0 || ar > 20 {
            errs["annualRate"] = String(localized: "Return 0–20%")
        }
        if lump < 0 || lump > 100_000_000 {
            errs["initialLumpSum"] = String(localized: "Lump sum 0–100,000,000 CZK")
        }
        if advancedEnabled {
            if adjRate < 0 || adjRate > 20 {
                errs["adjustmentRate"] = String(localized: "Rate must be 0–20%")
            }
            if esc < 0 || esc > 20 {
                errs["escalator"] = String(localized: "Annual increase must be 0–20%")
            }
            if isGoalSeek && (target <= 0 || target > 10_000_000) {
                errs["targetMonthlyRenta"] = String(localized: "Target annuity must be a positive value")
            }
        }

        return errs
    }

    var result: CalculationResult? {
        guard errors.isEmpty else { return nil }
        let ca = Int(currentAge) ?? 0
        let ra = Int(retirementAge) ?? 0
        let ry = Int(rentaYears) ?? 0
        let mi = Self.parseDouble(monthlyInvestment) ?? 0
        let ar = Self.parseDouble(annualRate) ?? 0
        let lump = Self.parseDouble(initialLumpSum) ?? 0
        let adjRate = Self.parseDouble(adjustmentRate) ?? 0
        let esc = Self.parseDouble(escalator) ?? 0
        let target = Self.parseDouble(targetMonthlyRenta) ?? 0

        let isGoalSeek = advancedEnabled && mode == .goalSeek
        let inputs = CalculationInputs(
            currentAge: ca,
            retirementAge: ra,
            rentaYears: ry,
            monthlyInvestment: mi,
            annualReturnRate: ar,
            initialLumpSum: lump,
            advanced: advancedEnabled,
            valueAdjustment: advancedEnabled
                ? ValueAdjustment(parameter: adjustmentParam, annualRate: adjRate)
                : nil,
            incomeEscalator: advancedEnabled ? esc : 0,
            mode: isGoalSeek ? .goalSeek : .forward,
            targetMonthlyRenta: isGoalSeek ? target : 0
        )
        return Calculator.calculate(inputs)
    }
}

struct ContentView: View {
    @State private var vm = RentaViewModel()

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

                AboutView()

                Spacer(minLength: 8)
            }
        }
        .scrollDismissesKeyboard(.interactively)
        // Tap on background dismisses keyboard
        .background(
            Color.clear.contentShape(Rectangle())
                .onTapGesture { Self.endEditing() }
        )
        .toolbar {
            ToolbarItemGroup(placement: .keyboard) {
                Spacer()
                Button(String(localized: "Done")) {
                    Self.endEditing()
                }
                .fontWeight(.semibold)
            }
        }
        .onChange(of: vm.result?.monthlyRenta) { _, newValue in
            if newValue != nil {
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.impactOccurred()
            }
        }
    }

    private static func endEditing() {
        UIApplication.shared.sendAction(
            #selector(UIResponder.resignFirstResponder),
            to: nil, from: nil, for: nil
        )
    }
}

#Preview {
    ContentView()
}
