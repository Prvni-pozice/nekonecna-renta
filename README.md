# Nekonečná renta

Kalkulačka měsíční renty z investic – dostupná jako webová aplikace i nativní iOS app.

- **Klasická renta** – jistina se postupně čerpá na 0 za zadaný počet let
- **Nekonečná renta** – vyplácíš jen měsíční výnosy, jistina zůstává nedotčená
- Graf vývoje kapitálu + rozklikávací rozpis výpočtu

---

## Web

Stack: Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest – výpočetní logika
npm run build      # produkční build
```

**Deploy na Vercel:** importuj repozitář, Vercel detekuje Next.js automaticky. Žádné env proměnné nejsou potřeba.

---

## iOS

Stack: SwiftUI · Swift 6 · iOS 17+ · Swift Charts

### Prerekvizity

- macOS s Xcode 15+
- [XcodeGen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`

### Vygenerování Xcode projektu

```bash
cd ios
xcodegen generate     # vytvoří NekonecnaRenta.xcodeproj
open NekonecnaRenta.xcodeproj
```

### Build a testy (z příkazové řádky)

```bash
cd ios
xcodebuild -scheme NekonecnaRenta \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build

xcodebuild test -scheme NekonecnaRenta \
  -destination 'platform=iOS Simulator,name=iPhone 15'
```

### Struktura zdrojových souborů

```
ios/
├── project.yml                        # XcodeGen konfigurace
├── AppStoreMetadata.md                # texty pro App Store
├── SUBMISSION_CHECKLIST.md            # kroky k vydání
└── NekonecnaRenta/
    ├── NekonecnaRentaApp.swift
    ├── PrivacyInfo.xcprivacy
    ├── Assets.xcassets/
    ├── Models/
    │   ├── CalculationInputs.swift
    │   └── CalculationResult.swift
    ├── Services/
    │   └── Calculator.swift           # port výpočetní logiky z web/lib/calculations.ts
    ├── Views/
    │   ├── ContentView.swift
    │   ├── InputSection.swift
    │   ├── ResultCardsView.swift
    │   ├── CapitalChartView.swift
    │   └── BreakdownView.swift
    └── Theme/
        └── Colors.swift
```

### App Store

Viz [`ios/AppStoreMetadata.md`](ios/AppStoreMetadata.md) a [`ios/SUBMISSION_CHECKLIST.md`](ios/SUBMISSION_CHECKLIST.md).  
Bundle ID placeholder: `cz.nazevfirmy.nekonecnarenta` – uprav v `ios/project.yml`.
