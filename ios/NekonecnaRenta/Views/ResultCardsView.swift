import SwiftUI

struct RentaCard: View {
    let title: String
    let amount: Int
    let subtitle: String
    let detail: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(Color.secondary)
                .lineLimit(2)
                .minimumScaleFactor(0.8)

            Text(amount.formattedCZK)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundStyle(Color.brandLime)
                .lineLimit(1)
                .minimumScaleFactor(0.6)

            Divider()

            Text(subtitle)
                .font(.caption)
                .foregroundStyle(Color.secondary)

            Text(detail)
                .font(.caption2)
                .foregroundStyle(Color.secondary.opacity(0.8))
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.brandLime.opacity(0.3), lineWidth: 1)
        )
    }
}

struct ResultCardsView: View {
    let result: CalculationResult

    var body: some View {
        ViewThatFits(in: .horizontal) {
            // Horizontal layout
            HStack(spacing: 12) {
                cards
            }
            .padding(.horizontal)

            // Vertical fallback for small screens
            VStack(spacing: 12) {
                cards
            }
            .padding(.horizontal)
        }
    }

    @ViewBuilder
    var cards: some View {
        RentaCard(
            title: "Renta na \(result.inputs.rentaYears) let",
            amount: result.monthlyRenta,
            subtitle: "Měsíční výplata po dobu \(result.inputs.rentaYears) let",
            detail: "Naspořeno: \(result.futureValue.formattedCZK)"
        )
        RentaCard(
            title: "Nekonečná renta",
            amount: result.infiniteRenta,
            subtitle: "Měsíční výplata navždy",
            detail: "Kapitál zůstane zachován"
        )
    }
}
