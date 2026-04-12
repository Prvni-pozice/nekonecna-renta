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

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Nastavení")
                .font(.headline)
                .fontWeight(.semibold)

            SliderInputField(
                label: "Aktuální věk",
                suffix: "let",
                text: $vm.currentAge,
                errorMessage: vm.errors["currentAge"],
                range: 18...80,
                step: 1,
                keyboardType: .numberPad
            )

            SliderInputField(
                label: "Věk do důchodu",
                suffix: "let",
                text: $vm.retirementAge,
                errorMessage: vm.errors["retirementAge"],
                range: retirementAgeRange,
                step: 1,
                keyboardType: .numberPad
            )

            SliderInputField(
                label: "Roky pobírání renty",
                suffix: "let",
                text: $vm.rentaYears,
                errorMessage: vm.errors["rentaYears"],
                range: 1...50,
                step: 1,
                keyboardType: .numberPad
            )

            SliderInputField(
                label: "Měsíční investice",
                suffix: "Kč",
                text: $vm.monthlyInvestment,
                errorMessage: vm.errors["monthlyInvestment"],
                range: 0...100_000,
                step: 500,
                keyboardType: .numberPad
            )

            // Roční zhodnocení with info button
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text("Roční zhodnocení")
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
                            Text("O ročním zhodnocení")
                                .font(.headline)
                            Text("Obvykle 4–10 % podle typu investic. Konzervativní portfolio ~4 %, vyvážené ~6 %, dynamické ~8–10 %. Nezohledňuje inflaci.")
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
