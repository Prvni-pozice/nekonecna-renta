'use client';

import { DictProvider } from '@/lib/dict-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <DictProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </DictProvider>
  );
}
