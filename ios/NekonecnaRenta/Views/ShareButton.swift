import SwiftUI

func shareText(result: CalculationResult) -> String {
    let inputs = result.inputs
    let years = inputs.retirementAge - inputs.currentAge

    return """
    📊 Moje výsledky z Nekonečné renty

    ⚙️ Nastavení
    • Věk: \(inputs.currentAge) → \(inputs.retirementAge) let (\(years) let spoření)
    • Měsíční investice: \(Int(inputs.monthlyInvestment).formattedCZK)
    • Roční zhodnocení: \(inputs.annualReturnRate) %

    💰 Naspořený kapitál: \(result.futureValue.formattedCZK)

    📈 Výsledky
    • Renta na \(inputs.rentaYears) let: \(result.monthlyRenta.formattedCZK) / měsíc
    • Nekonečná renta: \(result.infiniteRenta.formattedCZK) / měsíc
      (kapitál zůstane zachován)

    Spočítáno v aplikaci Nekonečná renta od První pozice
    www.prvni-pozice.com
    """
}

struct ShareButtonView: View {
    let result: CalculationResult

    var body: some View {
        ShareLink(item: shareText(result: result)) {
            Label("Sdílet výsledky", systemImage: "square.and.arrow.up")
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
