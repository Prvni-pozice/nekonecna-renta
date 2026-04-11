'use client';

import { FIRMA_NAZEV, FIRMA_WEB, FIRMA_EMAIL, FIRMA_TAGLINE, APP_VERSION } from '@/lib/branding';

export default function AboutSection() {
  return (
    <div className="space-y-5">
      {/* O aplikaci */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center justify-between select-none">
            <span className="text-sm font-medium text-white/50">O aplikaci</span>
            <span className="text-white/25 text-xs group-open:rotate-180 transition-transform inline-block">▼</span>
          </summary>

          <div className="mt-4 space-y-4">
            <p className="text-sm text-white/45 italic">{FIRMA_TAGLINE}</p>
            <p className="text-sm text-white/35 leading-relaxed">
              Aplikaci Nekonečná renta jsme vytvořili, aby si každý mohl jednoduše spočítat,
              kolik potřebuje odkládat a kolik mu to jednou přinese.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={FIRMA_WEB}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-sm py-2.5 px-4 rounded-xl font-medium text-black transition-colors"
                style={{ backgroundColor: '#A3E635' }}
              >
                Navštívit web 1P
              </a>
              <a
                href={`mailto:${FIRMA_EMAIL}`}
                className="block w-full text-center text-sm py-2.5 px-4 rounded-xl font-medium text-black transition-colors"
                style={{ backgroundColor: '#A3E635' }}
              >
                Napsat nám o podobnou aplikaci
              </a>
            </div>
          </div>
        </details>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 pt-5 pb-2 text-center space-y-1.5">
        <p className="text-sm text-white/30">
          Vytvořila{' '}
          <a
            href={FIRMA_WEB}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/50 transition-colors"
          >
            {FIRMA_NAZEV}
          </a>
        </p>
        <p className="text-xs text-white/15">
          v{APP_VERSION} · Orientační výpočet, nejedná se o investiční doporučení.
        </p>
      </div>
    </div>
  );
}
