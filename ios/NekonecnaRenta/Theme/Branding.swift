import Foundation

enum Branding {
    static let companyName = "První pozice"
    static let websiteURL  = "https://www.prvni-pozice.com"
    static let email       = "info@prvni-pozice.com"
    static let tagline     = "Pomáháme a budujeme svobodu."

    static var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }
}
