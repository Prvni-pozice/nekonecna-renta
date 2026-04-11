# App Store Submission Checklist – Nekonečná renta

Checklist pro ruční kroky v Xcode a App Store Connect.
Plň postupně shora dolů. Každý krok označ jako hotový.

---

## Prerekvizity

- [ ] **Apple Developer Program** – aktivní členství ($99/rok)
  - Registrace: https://developer.apple.com/programs/
  - Bez tohoto členství nelze publikovat na App Store.
- [ ] **macOS** s **Xcode 15 nebo novějším** nainstalovaný
  - Stáhni z Mac App Store zdarma.
- [ ] Apple ID přihlášeno v Xcode: *Xcode → Settings → Accounts*

---

## 1. Generování Xcode projektu (XcodeGen)

```bash
# Instalace XcodeGen (jednou)
brew install xcodegen

# Vygenerování projektu
cd /cesta/k/projektu/ios
xcodegen generate
```

Po dokončení se vytvoří soubor `NekonecnaRenta.xcodeproj`. Otevři ho v Xcode.

---

## 2. App ID v App Store Connect

- [ ] Přihlas se na https://appstoreconnect.apple.com
- [ ] *My Apps → + → New App*
  - Platform: iOS
  - Name: `Nekonečná renta`
  - Primary Language: Czech
  - Bundle ID: vyber odpovídající App ID (musí se shodovat s `project.yml`)
  - SKU: `nekonecna-renta` (interní identifikátor, není vidět uživateli)

---

## 3. Signing & Capabilities v Xcode

- [ ] Otevři projekt v Xcode
- [ ] Vyber target `NekonecnaRenta`
- [ ] Záložka *Signing & Capabilities*:
  - [ ] Zaškrtni **Automatically manage signing**
  - [ ] Vyber svůj **Team** (Apple Developer účet)
  - [ ] Ověř, že **Bundle Identifier** odpovídá App ID z App Store Connect
- [ ] Ověř, že nejsou zapnuté žádné nepotřebné capabilities (Push Notifications, iCloud, atd.)

---

## 4. Ikony aplikace

- [ ] Připrav ikony ve všech požadovaných velikostech:

  | Velikost (pt) | Scale | Výsledná velikost (px) | Použití |
  |---|---|---|---|
  | 20 | @2x | 40×40 | iPhone notifikace |
  | 20 | @3x | 60×60 | iPhone notifikace |
  | 29 | @2x | 58×58 | Settings |
  | 29 | @3x | 87×87 | Settings |
  | 40 | @2x | 80×80 | Spotlight |
  | 40 | @3x | 120×120 | Spotlight |
  | 60 | @2x | 120×120 | iPhone ikona |
  | 60 | @3x | 180×180 | iPhone ikona |
  | 76 | @1x | 76×76 | iPad |
  | 76 | @2x | 152×152 | iPad |
  | 83.5 | @2x | 167×167 | iPad Pro |
  | 1024 | @1x | 1024×1024 | App Store |

- [ ] Vlož soubory do `ios/NekonecnaRenta/Assets.xcassets/AppIcon.appiconset/`
- [ ] Aktualizuj `Contents.json` – doplň správné `"filename"` pro každou velikost
- [ ] Připrav variantu pro **dark mode** (volitelné, ale doporučené)
- [ ] Ověř ikony v Xcode (Asset Catalog Editor nesmí ukazovat žádná varování)

---

## 5. Screenshoty

Screenshoty jsou **povinné** pro každé zařízení, které chceš v App Store podporovat.

### Povinné velikosti

| Zařízení | Rozlišení | Poznámka |
|---|---|---|
| iPhone 6.9" (Pro Max) | 1320×2868 px | Nejnovější, povinný |
| iPhone 6.5" | 1242×2688 px | Pro starší iPhony |
| iPhone 5.5" | 1242×2208 px | Starší iPhony |
| iPad 12.9" (3. gen+) | 2048×2732 px | Pokud podporuješ iPad |

### Postup

- [ ] Spusť simulátor v Xcode: *Product → Run* (vyber správné zařízení)
- [ ] Pořiď screenshoty: v simulátoru *File → Save Screenshot* nebo `Cmd+S`
- [ ] Volitelně přidej text/rámečky pomocí nástroje jako Rottenwood nebo Screenshot Creator
- [ ] Nahraj screenshoty do App Store Connect v sekci daného zařízení

---

## 6. TestFlight – nahrání buildu

```
Xcode → Product → Archive
```

- [ ] Vyber scheme `NekonecnaRenta` a zařízení `Any iOS Device (arm64)`
- [ ] *Product → Archive* – počkej na dokončení
- [ ] V Xcode Organizer klikni **Distribute App**
- [ ] Zvol: *App Store Connect → Upload*
- [ ] Projdi průvodce (Automatically manage signing → Next → Upload)
- [ ] Po nahrání počkej cca 5–15 minut, než build zpracuje App Store Connect

### TestFlight interní testování

- [ ] V App Store Connect otevři *TestFlight*
- [ ] Přidej testery (e-mail) nebo sdílej interní odkaz
- [ ] Otestuj aplikaci na reálném zařízení

---

## 7. Metadata v App Store Connect

- [ ] Otevři *App Store Connect → My Apps → Nekonečná renta → App Store*
- [ ] Vyplň podle souboru `AppStoreMetadata.md`:
  - [ ] **Name**: Nekonečná renta
  - [ ] **Subtitle**: Kalkulačka finanční svobody
  - [ ] **Description**: zkopíruj sekci Popis
  - [ ] **Promotional Text**: zkopíruj sekci Promo text
  - [ ] **Keywords**: zkopíruj sekci Klíčová slova
  - [ ] **Support URL**: tvá webová stránka nebo GitHub repo
  - [ ] **Marketing URL**: (volitelné)
- [ ] Nastav **Category**: Finance
- [ ] Nastav **Age Rating**: 4+
- [ ] Nastav **Price**: Free

---

## 8. Privacy Questionnaire

V App Store Connect sekci *Privacy*:

- [ ] **Data Collection**: No, we do not collect data from this app
- [ ] Potvrd, že aplikace nepoužívá žádné tracking
- [ ] Ověř, že `PrivacyInfo.xcprivacy` je součástí targetu v Xcode
  - *Build Phases → Copy Bundle Resources* musí obsahovat `PrivacyInfo.xcprivacy`

---

## 9. Výběr buildu a submit

- [ ] V sekci *App Store → iOS App* klikni **+** u Build a vyber nahraný build
- [ ] Zkontroluj, že všechna povinná pole jsou vyplněna (žádné červené chyby)
- [ ] Klikni **Add for Review** nebo **Submit to App Review**
- [ ] Vyčkej na vyjádření Apple (obvykle 24–48 hodin, může být i déle)

---

## Po schválení

- [ ] Nastav datum vydání: okamžité nebo naplánované
- [ ] Zkontroluj, že aplikace je viditelná v App Store (vyhledej "Nekonečná renta")
- [ ] Sdílej odkaz na App Store s prvními uživateli

---

## Užitečné odkazy

- App Store Connect: https://appstoreconnect.apple.com
- Apple Developer: https://developer.apple.com
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- XcodeGen: https://github.com/yonaskolb/XcodeGen
