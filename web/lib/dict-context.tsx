'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Dict } from './translations/types';
import cs from './translations/cs';
import en from './translations/en';

const DictContext = createContext<Dict>(cs);

function detectLocale(): 'cs' | 'en' {
  if (typeof window === 'undefined') return 'cs';
  const lang = navigator.language.toLowerCase();
  return lang.startsWith('cs') ? 'cs' : 'en';
}

export function DictProvider({ children }: { children: ReactNode }) {
  const [dict, setDict] = useState<Dict>(cs);

  useEffect(() => {
    const locale = detectLocale();
    setDict(locale === 'cs' ? cs : en);
  }, []);

  return <DictContext.Provider value={dict}>{children}</DictContext.Provider>;
}

export function useDict(): Dict {
  return useContext(DictContext);
}
