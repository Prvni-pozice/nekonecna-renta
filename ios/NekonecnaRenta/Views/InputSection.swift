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

struct InputSection: View {
    @Bindable var vm: RentaViewModel
    @State private var showRateInfo = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Nastavení")
                .font(.headline)
                .fontWeight(.semibold)

            // Row 1: currentAge + retirementAge
            HStack(spacing: 12) {
                InputField(
                    label: "Aktuální věk",
                    suffix: "let",
                    text: $vm.currentAge,
                    errorMessage: vm.errors["currentAge"],
                    keyboardType: .numberPad
                )
                InputField(
                    label: "Věk do důchodu",
                    suffix: "let",
                    text: $vm.retirementAge,
                    errorMessage: vm.errors["retirementAge"],
                    keyboardType: .numberPad
                )
            }

            // Row 2: rentaYears + monthlyInvestment
            HStack(spacing: 12) {
                InputField(
                    label: "Roky pobírání renty",
                    suffix: "let",
                    text: $vm.rentaYears,
                    errorMessage: vm.errors["rentaYears"],
                    keyboardType: .numberPad
                )
                InputField(
                    label: "Měsíční investice",
                    suffix: "Kč",
                    text: $vm.monthlyInvestment,
                    errorMessage: vm.errors["monthlyInvestment"],
                    keyboardType: .decimalPad
                )
            }

            // Row 3: annual rate with info button
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

                    Stepper("", value: Binding(
                        get: { Double(vm.annualRate.replacingOccurrences(of: ",", with: ".")) ?? 0 },
                        set: { vm.annualRate = String(format: "%.1f", $0) }
                    ), in: 0...20, step: 0.1)
                    .labelsHidden()
                    .padding(.trailing, 4)

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
