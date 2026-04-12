import SwiftUI
import Charts

struct CapitalChartView: View {
    let result: CalculationResult

    @Environment(\.colorScheme) private var colorScheme

    private var areaGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color.brandLime.opacity(colorScheme == .dark ? 0.5 : 0.4),
                Color.brandLime.opacity(0.05)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Vývoj kapitálu v čase")
                .font(.headline)
                .fontWeight(.semibold)

            Chart {
                ForEach(result.chartData) { point in
                    AreaMark(
                        x: .value("Věk", point.age),
                        y: .value("Kapitál", point.capital)
                    )
                    .foregroundStyle(areaGradient)
                    .interpolationMethod(.monotone)

                    LineMark(
                        x: .value("Věk", point.age),
                        y: .value("Kapitál", point.capital)
                    )
                    .foregroundStyle(Color.brandLime)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                    .interpolationMethod(.monotone)
                }

                RuleMark(x: .value("Důchod", result.inputs.retirementAge))
                    .foregroundStyle(Color.secondary.opacity(0.5))
                    .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [5, 3]))
                    .annotation(position: .top, alignment: .center) {
                        Text("Důchod")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundStyle(Color.secondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color(.systemBackground))
                                    .shadow(radius: 1)
                            )
                    }
            }
            .chartYAxis {
                AxisMarks(values: .automatic(desiredCount: 5)) { value in
                    AxisGridLine()
                        .foregroundStyle(Color.secondary.opacity(0.2))
                    AxisValueLabel {
                        if let intVal = value.as(Int.self) {
                            Text(intVal.formattedCompact)
                                .font(.caption2)
                                .foregroundStyle(Color.secondary)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks(values: .automatic(desiredCount: 6)) { value in
                    AxisGridLine()
                        .foregroundStyle(Color.secondary.opacity(0.2))
                    AxisValueLabel {
                        if let intVal = value.as(Int.self) {
                            Text("\(intVal)")
                                .font(.caption2)
                                .foregroundStyle(Color.secondary)
                        }
                    }
                }
            }
            .chartXScale(domain: result.inputs.currentAge...(result.chartData.last?.age ?? result.inputs.retirementAge))
            .frame(height: 260)

            // Legend
            HStack(spacing: 16) {
                HStack(spacing: 6) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.brandLime)
                        .frame(width: 16, height: 3)
                    Text("Hodnota portfolia")
                        .font(.caption2)
                        .foregroundStyle(Color.secondary)
                }
                HStack(spacing: 6) {
                    Rectangle()
                        .fill(Color.secondary.opacity(0.5))
                        .frame(width: 16, height: 1)
                    Text("Věk odchodu do důchodu")
                        .font(.caption2)
                        .foregroundStyle(Color.secondary)
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
