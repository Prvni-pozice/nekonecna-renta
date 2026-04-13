import SwiftUI

extension Color {
    static let brandLime = Color(red: 0.639, green: 0.898, blue: 0.208)   // #A3E635
    static let brandAnthracite = Color(red: 0.122, green: 0.161, blue: 0.216) // #1F2937
}

private var isCzechLocale: Bool {
    Bundle.main.preferredLocalizations.first?.hasPrefix("cs") ?? false
}

extension Int {
    var formattedCZK: String {
        if isCzechLocale {
            let formatter = NumberFormatter()
            formatter.numberStyle = .decimal
            formatter.locale = Locale(identifier: "cs_CZ")
            formatter.groupingSeparator = "\u{202F}"
            formatter.minimumFractionDigits = 0
            formatter.maximumFractionDigits = 0
            let formatted = formatter.string(from: NSNumber(value: self)) ?? "\(self)"
            return "\(formatted) Kč"
        } else {
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.locale = Locale(identifier: "en_GB")
            formatter.currencyCode = "EUR"
            formatter.maximumFractionDigits = 0
            return formatter.string(from: NSNumber(value: self)) ?? "€\(self)"
        }
    }

    var formattedCompact: String {
        let absVal = abs(self)
        if isCzechLocale {
            if absVal >= 1_000_000 {
                let formatter = NumberFormatter()
                formatter.locale = Locale(identifier: "cs_CZ")
                formatter.minimumFractionDigits = 0
                formatter.maximumFractionDigits = 1
                let num = formatter.string(from: NSNumber(value: Double(self) / 1_000_000.0)) ?? "\(self)"
                return "\(num) mil"
            } else if absVal >= 1_000 {
                let formatter = NumberFormatter()
                formatter.locale = Locale(identifier: "cs_CZ")
                formatter.minimumFractionDigits = 0
                formatter.maximumFractionDigits = 0
                let num = formatter.string(from: NSNumber(value: Double(self) / 1_000.0)) ?? "\(self)"
                return "\(num) tis"
            } else {
                return "\(self)"
            }
        } else {
            if absVal >= 1_000_000 {
                let formatter = NumberFormatter()
                formatter.locale = Locale(identifier: "en_GB")
                formatter.minimumFractionDigits = 0
                formatter.maximumFractionDigits = 1
                let num = formatter.string(from: NSNumber(value: Double(self) / 1_000_000.0)) ?? "\(self)"
                return "€\(num)M"
            } else if absVal >= 1_000 {
                let formatter = NumberFormatter()
                formatter.locale = Locale(identifier: "en_GB")
                formatter.minimumFractionDigits = 0
                formatter.maximumFractionDigits = 0
                let num = formatter.string(from: NSNumber(value: Double(self) / 1_000.0)) ?? "\(self)"
                return "€\(num)K"
            } else {
                return "€\(self)"
            }
        }
    }
}
