import SwiftUI

struct InputField: View {
    let label: String
    let suffix: String
    @Binding var text: String
    let errorMessage: String?
    var keyboardType: UIKeyboardType = .decimalPad

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(Color.secondary)

            HStack(spacing: 0) {
                TextField("0", text: $text)
                    .keyboardType(keyboardType)
                    .font(.body)
                    .padding(.vertical, 10)
                    .padding(.leading, 12)

                Text(suffix)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
                    .padding(.trailing, 12)
                    .padding(.vertical, 10)
            }
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(.systemGray6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(errorMessage != nil ? Color.red.opacity(0.7) : Color.clear, lineWidth: 1)
            )

            if let error = errorMessage {
                Text(error)
                    .font(.caption2)
                    .foregroundStyle(Color.red)
            }
        }
    }
}

struct SliderInputField: View {
    let label: String
    let suffix: String
    @Binding var text: String
    let errorMessage: String?
    let range: ClosedRange<Double>
    let step: Double
    var keyboardType: UIKeyboardType = .numberPad
    var format: String = "%.0f"

    private var sliderValue: Binding<Double> {
        Binding(
            get: {
                let normalized = text.replacingOccurrences(of: ",", with: ".")
                let parsed = Double(normalized) ?? range.lowerBound
                return min(max(parsed, range.lowerBound), range.upperBound)
            },
            set: { newValue in
                text = String(format: format, newValue)
            }
        )
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(Color.secondary)

            HStack(spacing: 0) {
                TextField("0", text: $text)
                    .keyboardType(keyboardType)
                    .font(.body)
                    .padding(.vertical, 10)
                    .padding(.leading, 12)

                Text(suffix)
                    .font(.caption)
                    .foregroundStyle(Color.secondary)
                    .padding(.trailing, 12)
                    .padding(.vertical, 10)
            }
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(.systemGray6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(errorMessage != nil ? Color.red.opacity(0.7) : Color.clear, lineWidth: 1)
            )

            Slider(value: sliderValue, in: range, step: step)
                .tint(Color.brandLime)

            if let error = errorMessage {
                Text(error)
                    .font(.caption2)
                    .foregroundStyle(Color.red)
            }
        }
    }
}

struct InputSection: View {
    @Bindable var vm: RentaViewModel
    @State private var showRateInfo = false

    private var retirementAgeRange: ClosedRange<Double> {
        let minAge = Double(max(Int(vm.currentAge) ?? 19, 18) + 1)
        return minAge...85
    }

    private var isGoalSeek: Bool {
        vm.advancedEnabled && vm.mode == .goalSeek
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Settings")
                .font(.headline)
                .fontWeight(.semibold)

            SliderInputField(
                label: String(localized: "Current age"),
                suffix: String(localized: "yrs"),
                text: $vm.currentAge,
                errorMessage: vm.errors["currentAge"],
                range: 18...80,
                step: 1,
                keyboardType: .numberPad
            )

            SliderInputField(
                label: String(localized: "Retirement age"),
                suffix: String(localized: "yrs"),
                text: $vm.retirementAge,
                errorMessage: vm.errors["retirementAge"],
                range: retirementAgeRange,
                step: 1,
                keyboardType: .numberPad
            )

            SliderInputField(
                label: String(localized: "Annuity years"),
                suffix: String(localized: "yrs"),
                text: $vm.rentaYears,
                errorMessage: vm.errors["rentaYears"],
                range: 1...50,
                step: 1,
                keyboardType: .numberPad
            )

            // Monthly investment — hidden in goal-seek mode (computed instead)
            if !isGoalSeek {
                SliderInputField(
                    label: String(localized: "Monthly investment"),
                    suffix: "Kč",
                    text: $vm.monthlyInvestment,
                    errorMessage: vm.errors["monthlyInvestment"],
                    range: 0...100_000,
                    step: 500,
                    keyboardType: .numberPad
                )
            }

            // Lump sum disclosure
            DisclosureGroup(isExpanded: $vm.lumpSumExpanded) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 0) {
                        TextField("0", text: $vm.initialLumpSum)
                            .keyboardType(.numberPad)
                            .font(.body)
                            .padding(.vertical, 10)
                            .padding(.leading, 12)

                        Text("Kč")
                            .font(.caption)
                            .foregroundStyle(Color.secondary)
                            .padding(.trailing, 12)
                            .padding(.vertical, 10)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color(.systemGray6))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(vm.errors["initialLumpSum"] != nil ? Color.red.opacity(0.7) : Color.clear, lineWidth: 1)
                    )

                    if let error = vm.errors["initialLumpSum"] {
                        Text(error)
                            .font(.caption2)
                            .foregroundStyle(Color.red)
                    }
                }
                .padding(.top, 6)
            } label: {
                Text("I also have an initial lump sum")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(Color.primary)
            }
            .tint(Color.brandLime)

            Divider()

            // Advanced mode master toggle
            Toggle(isOn: $vm.advancedEnabled) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Advanced mode")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.primary)
                    Text("Inflation, escalator, goal seek")
                        .font(.caption2)
                        .foregroundStyle(Color.secondary)
                }
            }
            .tint(Color.brandLime)

            if vm.advancedEnabled {
                AdvancedInputSection(vm: vm)
            }

            Divider()

            // Annual return with info button
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text("Annual return")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(Color.secondary)

                    Button {
                        showRateInfo.toggle()
                    } label: {
                        Image(systemName: "info.circle")
                            .font(.caption)
                            .foregroundStyle(Color.secondary)
                    }
                    .popover(isPresented: $showRateInfo) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("About Annual Return")
                                .font(.headline)
                            Text("Usually 4–10% depending on investment type. Conservative portfolio ~4%, balanced ~6%, aggressive ~8–10%. Excludes inflation.")
                                .font(.body)
                        }
                        .padding()
                        .frame(maxWidth: 300)
                        .presentationCompactAdaptation(.popover)
                    }
                }

                HStack(spacing: 0) {
                    TextField("0", text: $vm.annualRate)
                        .keyboardType(.decimalPad)
                        .font(.body)
                        .padding(.vertical, 10)
                        .padding(.leading, 12)

                    Text("%")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                        .padding(.trailing, 12)
                        .padding(.vertical, 10)
                }
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color(.systemGray6))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(vm.errors["annualRate"] != nil ? Color.red.opacity(0.7) : Color.clear, lineWidth: 1)
                )

                Slider(
                    value: Binding(
                        get: {
                            let normalized = vm.annualRate.replacingOccurrences(of: ",", with: ".")
                            let parsed = Double(normalized) ?? 0
                            return min(max(parsed, 0), 20)
                        },
                        set: { vm.annualRate = String(format: "%.1f", $0) }
                    ),
                    in: 0...20,
                    step: 1
                )
                .tint(Color.brandLime)

                if let error = vm.errors["annualRate"] {
                    Text(error)
                        .font(.caption2)
                        .foregroundStyle(Color.red)
                }
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

// MARK: - Advanced section

private struct AdvancedInputSection: View {
    @Bindable var vm: RentaViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            // What to compute (mode picker)
            VStack(alignment: .leading, spacing: 6) {
                Text("What to compute")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(Color.secondary)

                Picker("", selection: $vm.mode) {
                    Text("Compute the resulting annuity").tag(CalcMode.forward)
                    Text("Compute the required deposit").tag(CalcMode.goalSeek)
                }
                .pickerStyle(.segmented)
            }

            // Target annuity (only in goal-seek mode)
            if vm.mode == .goalSeek {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Target monthly annuity")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(Color.secondary)

                    HStack(spacing: 0) {
                        TextField("0", text: $vm.targetMonthlyRenta)
                            .keyboardType(.numberPad)
                            .font(.body)
                            .padding(.vertical, 10)
                            .padding(.leading, 12)
                        Text("Kč")
                            .font(.caption)
                            .foregroundStyle(Color.secondary)
                            .padding(.trailing, 12)
                            .padding(.vertical, 10)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color(.systemGray6))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(vm.errors["targetMonthlyRenta"] != nil ? Color.red.opacity(0.7) : Color.clear, lineWidth: 1)
                    )

                    if let error = vm.errors["targetMonthlyRenta"] {
                        Text(error)
                            .font(.caption2)
                            .foregroundStyle(Color.red)
                    }

                    if let derived = vm.result?.derivedMonthlyInvestment {
                        Text(String(format: String(localized: "Required monthly deposit: %@"), derived.formattedCZK))
                            .font(.caption)
                            .foregroundStyle(Color.brandLime)
                            .padding(.top, 2)
                    }
                }
            }

            // Value adjustment
            VStack(alignment: .leading, spacing: 6) {
                Text("Modelling value over time")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(Color.secondary)

                Picker("", selection: Binding(
                    get: { vm.adjustmentParam },
                    set: { vm.selectAdjustmentParam($0) }
                )) {
                    ForEach(ValueAdjustmentParam.allCases, id: \.self) { p in
                        Text(p.localizedName).tag(p)
                    }
                }
                .pickerStyle(.segmented)

                HStack(spacing: 0) {
                    TextField("0", text: $vm.adjustmentRate)
                        .keyboardType(.decimalPad)
                        .font(.body)
                        .padding(.vertical, 10)
                        .padding(.leading, 12)
                    Text("% / \(String(localized: "yr"))")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                        .padding(.trailing, 12)
                        .padding(.vertical, 10)
                }
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color(.systemGray6))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(vm.errors["adjustmentRate"] != nil ? Color.red.opacity(0.7) : Color.clear, lineWidth: 1)
                )

                if let error = vm.errors["adjustmentRate"] {
                    Text(error)
                        .font(.caption2)
                        .foregroundStyle(Color.red)
                }
            }

            // Income escalator
            VStack(alignment: .leading, spacing: 4) {
                Text("Annual increase of monthly investment")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(Color.secondary)

                HStack(spacing: 0) {
                    TextField("0", text: $vm.escalator)
                        .keyboardType(.decimalPad)
                        .font(.body)
                        .padding(.vertical, 10)
                        .padding(.leading, 12)
                    Text("% / \(String(localized: "yr"))")
                        .font(.caption)
                        .foregroundStyle(Color.secondary)
                        .padding(.trailing, 12)
                        .padding(.vertical, 10)
                }
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color(.systemGray6))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(vm.errors["escalator"] != nil ? Color.red.opacity(0.7) : Color.clear, lineWidth: 1)
                )

                if let error = vm.errors["escalator"] {
                    Text(error)
                        .font(.caption2)
                        .foregroundStyle(Color.red)
                }
            }
        }
        .padding(.leading, 8)
        .padding(.top, 4)
    }
}
