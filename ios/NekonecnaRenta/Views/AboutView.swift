import SwiftUI
import SafariServices
import MessageUI

// MARK: – SFSafariViewController wrapper

struct SafariView: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }
    func updateUIViewController(_ vc: SFSafariViewController, context: Context) {}
}

// MARK: – MFMailComposeViewController wrapper

struct MailComposeView: UIViewControllerRepresentable {
    let recipient: String
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> MFMailComposeViewController {
        let vc = MFMailComposeViewController()
        vc.setToRecipients([recipient])
        vc.mailComposeDelegate = context.coordinator
        return vc
    }
    func updateUIViewController(_ vc: MFMailComposeViewController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(dismiss: dismiss) }

    class Coordinator: NSObject, MFMailComposeViewControllerDelegate {
        let dismiss: DismissAction
        init(dismiss: DismissAction) { self.dismiss = dismiss }
        func mailComposeController(_ controller: MFMailComposeViewController,
                                   didFinishWith result: MFMailComposeResult,
                                   error: Error?) {
            Task { @MainActor [dismiss] in dismiss() }
        }
    }
}

// MARK: – AboutView

struct AboutView: View {
    @State private var isExpanded = false
    @State private var showSafari = false
    @State private var showMailCompose = false

    var body: some View {
        VStack(spacing: 20) {
            // O aplikaci – DisclosureGroup
            VStack(alignment: .leading, spacing: 0) {
                DisclosureGroup(isExpanded: $isExpanded) {
                    VStack(alignment: .leading, spacing: 14) {
                        Text(Branding.tagline)
                            .font(.body)
                            .italic()
                            .foregroundStyle(Color.brandLime)

                        Text("Aplikaci Nekonečná renta jsme vytvořili, aby si každý mohl jednoduše spočítat, kolik potřebuje odkládat a kolik mu to jednou přinese.")
                            .font(.body)
                            .foregroundStyle(Color.secondary)

                        VStack(spacing: 10) {
                            Button("Navštívit web 1P") {
                                showSafari = true
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.brandLime)
                            .foregroundStyle(Color.black)
                            .frame(maxWidth: .infinity)

                            Button("Napsat nám o podobnou aplikaci") {
                                if MFMailComposeViewController.canSendMail() {
                                    showMailCompose = true
                                } else if let url = URL(string: "mailto:\(Branding.email)") {
                                    UIApplication.shared.open(url)
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.brandLime)
                            .foregroundStyle(Color.black)
                            .frame(maxWidth: .infinity)
                        }
                        .padding(.top, 4)
                    }
                    .padding(.top, 12)
                } label: {
                    Text("O aplikaci")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.primary)
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
                    .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 2)
            )
            .padding(.horizontal)

            // Footer
            VStack(spacing: 6) {
                Divider()
                    .padding(.horizontal)

                Button {
                    showSafari = true
                } label: {
                    Text("Vytvořila ")
                        .foregroundStyle(Color.secondary) +
                    Text(Branding.companyName)
                        .underline()
                        .foregroundStyle(Color.secondary)
                }
                .font(.footnote)

                Text("v\(Branding.appVersion) · Orientační výpočet, nejedná se o investiční doporučení.")
                    .font(.caption2)
                    .foregroundStyle(Color.secondary.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            .padding(.bottom, 8)
        }
        .sheet(isPresented: $showSafari) {
            if let url = URL(string: Branding.websiteURL) {
                SafariView(url: url)
                    .ignoresSafeArea()
            }
        }
        .sheet(isPresented: $showMailCompose) {
            MailComposeView(recipient: Branding.email)
                .ignoresSafeArea()
        }
    }
}
