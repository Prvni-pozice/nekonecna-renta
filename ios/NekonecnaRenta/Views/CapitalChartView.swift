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

    private static let realValueColor = Color(red: 0.984, green: 0.749, blue: 0.141) // amber #fbbf24

    private var hasRealValue: Bool {
        result.chartData.contains { $0.realValue != nil }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Capital development over time")
                .font(.headline)
                .fontWeight(.semibold)

            Chart {
                ForEach(result.chartData) { point in
                    AreaMark(
                        x: .value(String(localized: "Age"), point.age),
                        y: .value(String(localized: "Capital"), point.capital)
                    )
                    .foregroundStyle(areaGradient)
                    .interpolationMethod(.monotone)

                    LineMark(
                        x: .value(String(localized: "Age"), point.age),
                        y: .value(String(localized: "Capital"), point.capital)
                    )
                    .foregroundStyle(Color.brandLime)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                    .interpolationMethod(.monotone)

                    if let real = point.realValue {
                        LineMark(
                            x: .value(String(localized: "Age"), point.age),
                            y: .value(String(localized: "In today's value"), real)
                        )
                        .foregroundStyle(Self.realValueColor)
                        .lineStyle(StrokeStyle(lineWidth: 2, dash: [5, 3]))
                        .interpolationMethod(.monotone)
                    }
                }

                RuleMark(x: .value(String(localized: "Retirement"), result.inputs.retirementAge))
                    .foregroundStyle(Color.secondary.opacity(0.5))
                    .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [5, 3]))
                    .annotation(position: .top, alignment: .center) {
                        Text("Retirement")
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
            .chartXScale(domain: result.inputs.currentAge...(result.inputs.retirementAge + result.inputs.rentaYears))
            .frame(height: 260)

            // Legend
            HStack(spacing: 16) {
                HStack(spacing: 6) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.brandLime)
                        .frame(width: 16, height: 3)
                    Text("Portfolio value")
                        .font(.caption2)
                        .foregroundStyle(Color.secondary)
                }
                if hasRealValue {
                    HStack(spacing: 6) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Self.realValueColor)
                            .frame(width: 16, height: 3)
                        Text("In today's value")
                            .font(.caption2)
                            .foregroundStyle(Color.secondary)
                    }
                }
                HStack(spacing: 6) {
                    Rectangle()
                        .fill(Color.secondary.opacity(0.5))
                        .frame(width: 16, height: 1)
                    Text("Retirement age")
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
