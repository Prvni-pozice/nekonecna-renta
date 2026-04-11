import SwiftUI

extension Color {
    static let brandLime = Color(red: 0.639, green: 0.898, blue: 0.208)   // #A3E635
    static let brandAnthracite = Color(red: 0.122, green: 0.161, blue: 0.216) // #1F2937
}

extension Int {
    var formattedCZK: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: "cs_CZ")
        formatter.groupingSeparator = "\u{202F}"
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 0
        let formatted = formatter.string(from: NSNumber(value: self)) ?? "\(self)"
        return "\(formatted) Kč"
    }

    var formattedCompact: String {
        let absVal = abs(self)
        if absVal >= 1_000_000 {
            let millions = Double(self) / 1_000_000.0
            let formatter = NumberFormatter()
            formatter.locale = Locale(identifier: "cs_CZ")
            formatter.minimumFractionDigits = 0
            formatter.maximumFractionDigits = 1
            let num = formatter.string(from: NSNumber(value: millions)) ?? "\(millions)"
            return "\(num) mil"
        } else if absVal >= 1_000 {
            let thousands = Double(self) / 1_000.0
            let formatter = NumberFormatter()
            formatter.locale = Locale(identifier: "cs_CZ")
            formatter.minimumFractionDigits = 0
            formatter.maximumFractionDigits = 0
            let num = formatter.string(from: NSNumber(value: thousands)) ?? "\(thousands)"
            return "\(num) tis"
        } else {
            return "\(self)"
        }
    }
}
